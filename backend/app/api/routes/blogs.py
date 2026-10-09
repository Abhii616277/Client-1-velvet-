import re
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.routes.admin import get_current_admin_user
from app.core.database import get_db
from app.models.blog_post import BlogPost
from app.models.user import User
from app.schemas.blog import BlogPostCreate, BlogPostOut, BlogPostUpdate

router = APIRouter()


def slugify(text: str) -> str:
    cleaned = re.sub(r'[^\w\s-]', '', text).strip().lower()
    slug = re.sub(r'[-\s]+', '-', cleaned)
    return slug or 'post'


def generate_unique_slug(db: Session, base_text: str, current_post_id: int | None = None) -> str:
    base_slug = slugify(base_text)
    candidate = base_slug
    counter = 1

    while True:
        query = db.query(BlogPost).filter(BlogPost.slug == candidate)
        if current_post_id:
            query = query.filter(BlogPost.id != current_post_id)
        if not query.first():
            return candidate
        counter += 1
        candidate = f'{base_slug}-{counter}'


# --- Public Endpoints ---

@router.get('', response_model=list[BlogPostOut])
def list_published_blogs(db: Session = Depends(get_db)):
    """Return published blog posts for public visitors, ordered by published_at / created_at desc."""
    return (
        db.query(BlogPost)
        .filter(BlogPost.status == 'published')
        .order_by(BlogPost.published_at.desc().nullslast(), BlogPost.created_at.desc())
        .all()
    )


# --- Admin Endpoints (Require Admin JWT) ---
# NOTE: These MUST be registered before /{identifier} to avoid wildcard shadowing.

@router.get('/admin/all', response_model=list[BlogPostOut])
def list_all_blogs_for_admin(
    db: Session = Depends(get_db),
    _admin: User = Depends(get_current_admin_user),
):
    """Admin view: returns all articles (drafts and published)."""
    return db.query(BlogPost).order_by(BlogPost.created_at.desc()).all()


@router.get('/{identifier}', response_model=BlogPostOut)
def get_published_blog(identifier: str, db: Session = Depends(get_db)):
    """Return a single published blog post by numeric ID or URL slug."""
    query = db.query(BlogPost).filter(BlogPost.status == 'published')
    if identifier.isdigit():
        post = query.filter((BlogPost.id == int(identifier)) | (BlogPost.slug == identifier)).first()
    else:
        post = query.filter(BlogPost.slug == identifier).first()

    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Blog post not found',
        )
    return post


@router.post('', response_model=BlogPostOut, status_code=status.HTTP_201_CREATED)
def create_blog(
    payload: BlogPostCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user),
):
    """Admin endpoint to create a new blog article."""
    raw_title = payload.title.strip()
    if not raw_title:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail='Title cannot be empty')

    raw_content = payload.content.strip()
    if not raw_content:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail='Content cannot be empty')

    slug_seed = payload.slug.strip() if payload.slug and payload.slug.strip() else raw_title
    final_slug = generate_unique_slug(db, slug_seed)

    status_val = (payload.status or 'draft').strip().lower()
    if status_val not in ('draft', 'published'):
        status_val = 'draft'

    now = datetime.now(timezone.utc)
    published_at = now if status_val == 'published' else None

    blog_post = BlogPost(
        title=raw_title,
        slug=final_slug,
        excerpt=payload.excerpt.strip() if payload.excerpt else None,
        content=raw_content,
        featured_image=payload.featured_image.strip() if payload.featured_image else None,
        author=admin.name or 'Admin',
        status=status_val,
        published_at=published_at,
    )
    db.add(blog_post)
    db.commit()
    db.refresh(blog_post)
    return blog_post


@router.put('/{blog_id}', response_model=BlogPostOut)
def update_blog(
    blog_id: int,
    payload: BlogPostUpdate,
    db: Session = Depends(get_db),
    _admin: User = Depends(get_current_admin_user),
):
    """Admin endpoint to update an existing blog article."""
    post = db.query(BlogPost).filter(BlogPost.id == blog_id).first()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Blog post not found')

    update_data = payload.model_dump(exclude_unset=True)

    if 'title' in update_data and update_data['title'] is not None:
        title = update_data['title'].strip()
        if not title:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail='Title cannot be empty')
        post.title = title

    if 'content' in update_data and update_data['content'] is not None:
        content = update_data['content'].strip()
        if not content:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail='Content cannot be empty')
        post.content = content

    if 'excerpt' in update_data:
        post.excerpt = update_data['excerpt'].strip() if update_data['excerpt'] else None

    if 'featured_image' in update_data:
        post.featured_image = update_data['featured_image'].strip() if update_data['featured_image'] else None

    if 'slug' in update_data and update_data['slug']:
        post.slug = generate_unique_slug(db, update_data['slug'], current_post_id=post.id)

    if 'status' in update_data and update_data['status'] is not None:
        new_status = update_data['status'].strip().lower()
        if new_status in ('draft', 'published'):
            if new_status == 'published' and post.status != 'published' and not post.published_at:
                post.published_at = datetime.now(timezone.utc)
            post.status = new_status

    db.commit()
    db.refresh(post)
    return post


@router.delete('/{blog_id}')
def delete_blog(
    blog_id: int,
    db: Session = Depends(get_db),
    _admin: User = Depends(get_current_admin_user),
):
    """Admin endpoint to delete a blog article."""
    post = db.query(BlogPost).filter(BlogPost.id == blog_id).first()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Blog post not found')

    db.delete(post)
    db.commit()
    return {'message': 'Blog post deleted', 'id': blog_id}
