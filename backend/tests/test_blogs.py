from datetime import datetime, timezone
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.core.security import hash_password
from app.main import app
from app.models.blog_post import BlogPost
from app.models.user import User


@pytest.fixture
def blog_setup():
    test_engine = create_engine(
        'sqlite://',
        connect_args={'check_same_thread': False},
        poolclass=StaticPool,
    )
    TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
    Base.metadata.create_all(bind=test_engine)

    db = TestingSession()
    admin = User(
        name='Test Admin',
        email='blogadmin@velvettouchspa.in',
        password_hash=hash_password('blogpass123'),
        role='admin',
    )
    db.add(admin)

    published_post = BlogPost(
        title='5 Benefits of Swedish Massage',
        slug='5-benefits-of-swedish-massage',
        excerpt='Discover how Swedish massage relieves stress and promotes well-being.',
        content='Full article content about Swedish massage techniques and health benefits.',
        featured_image='https://images.unsplash.com/photo-1540555700478-4be289fbecef',
        author='Test Admin',
        status='published',
        published_at=datetime.now(timezone.utc),
    )
    db.add(published_post)

    draft_post = BlogPost(
        title='Secret Draft Article',
        slug='secret-draft-article',
        excerpt='This is a draft.',
        content='Draft content not intended for the public yet.',
        author='Test Admin',
        status='draft',
    )
    db.add(draft_post)
    db.commit()
    db.close()

    def override_get_db():
        session = TestingSession()
        try:
            yield session
        finally:
            session.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield {'client': test_client, 'session': TestingSession}
    app.dependency_overrides.pop(get_db, None)


def get_admin_token(client):
    res = client.post('/api/v1/auth/login', json={'email': 'blogadmin@velvettouchspa.in', 'password': 'blogpass123'})
    assert res.status_code == 200
    return res.json()['access_token']


def test_public_can_view_published_blogs_only(blog_setup):
    client = blog_setup['client']
    res = client.get('/api/v1/blogs')
    assert res.status_code == 200
    blogs = res.json()
    assert len(blogs) == 1
    assert blogs[0]['slug'] == '5-benefits-of-swedish-massage'
    assert blogs[0]['status'] == 'published'


def test_public_can_view_single_published_blog_by_slug_and_id(blog_setup):
    client = blog_setup['client']
    # By slug
    res_slug = client.get('/api/v1/blogs/5-benefits-of-swedish-massage')
    assert res_slug.status_code == 200
    data = res_slug.json()
    assert data['title'] == '5 Benefits of Swedish Massage'
    post_id = data['id']

    # By ID
    res_id = client.get(f'/api/v1/blogs/{post_id}')
    assert res_id.status_code == 200
    assert res_id.json()['slug'] == '5-benefits-of-swedish-massage'


def test_public_cannot_view_draft_blog(blog_setup):
    client = blog_setup['client']
    db = blog_setup['session']()
    # Draft by slug
    res = client.get('/api/v1/blogs/secret-draft-article')
    assert res.status_code == 404

    # Finding draft ID
    draft = db.query(BlogPost).filter(BlogPost.slug == 'secret-draft-article').first()
    draft_id = draft.id
    db.close()

    # Draft by ID
    res_id = client.get(f'/api/v1/blogs/{draft_id}')
    assert res_id.status_code == 404


def test_unauthenticated_cannot_create_update_delete_blogs(blog_setup):
    client = blog_setup['client']
    # Create
    res_create = client.post('/api/v1/blogs', json={'title': 'Hack', 'content': 'Content'})
    assert res_create.status_code == 401

    # Update
    res_update = client.put('/api/v1/blogs/1', json={'title': 'Hacked Title'})
    assert res_update.status_code == 401

    # Delete
    res_delete = client.delete('/api/v1/blogs/1')
    assert res_delete.status_code == 401


def test_admin_crud_workflow_and_slug_handling(blog_setup):
    client = blog_setup['client']
    token = get_admin_token(client)
    headers = {'Authorization': f'Bearer {token}'}

    # 1. Admin views all posts including drafts
    all_res = client.get('/api/v1/blogs/admin/all', headers=headers)
    assert all_res.status_code == 200
    all_posts = all_res.json()
    assert len(all_posts) >= 2

    # 2. Admin creates a new draft post with automatic slug generation
    create_res = client.post(
        '/api/v1/blogs',
        headers=headers,
        json={
            'title': 'Aromatherapy & Wellness Guide!',
            'excerpt': 'A simple guide to aromatherapy.',
            'content': 'Paragraph 1 of guide.\nParagraph 2 of guide.',
            'featured_image': 'https://example.com/aroma.jpg',
            'status': 'draft',
        },
    )
    assert create_res.status_code == 201
    created_post = create_res.json()
    created_id = created_post['id']
    assert created_post['slug'] == 'aromatherapy-wellness-guide'
    assert created_post['status'] == 'draft'

    # Should not be accessible to public
    assert client.get(f'/api/v1/blogs/{created_post["slug"]}').status_code == 404

    # 3. Duplicate slug handled gracefully
    dup_res = client.post(
        '/api/v1/blogs',
        headers=headers,
        json={
            'title': 'Aromatherapy & Wellness Guide!',
            'content': 'Another post with same title',
            'status': 'draft',
        },
    )
    assert dup_res.status_code == 201
    dup_post = dup_res.json()
    assert dup_post['slug'] == 'aromatherapy-wellness-guide-2'

    # 4. Admin updates and publishes the post
    update_res = client.put(
        f'/api/v1/blogs/{created_id}',
        headers=headers,
        json={
            'status': 'published',
            'title': 'Aromatherapy & Wellness Guide - Updated',
        },
    )
    assert update_res.status_code == 200
    updated_post = update_res.json()
    assert updated_post['status'] == 'published'
    assert updated_post['published_at'] is not None

    # Now it IS accessible to public
    public_check = client.get(f'/api/v1/blogs/{created_post["slug"]}')
    assert public_check.status_code == 200
    assert public_check.json()['title'] == 'Aromatherapy & Wellness Guide - Updated'

    # 5. Admin deletes the duplicate post
    del_res = client.delete(f'/api/v1/blogs/{dup_post["id"]}', headers=headers)
    assert del_res.status_code == 200

    # Verify deleted
    all_after_del = client.get('/api/v1/blogs/admin/all', headers=headers).json()
    assert not any(p['id'] == dup_post['id'] for p in all_after_del)
