from datetime import date, time, timedelta
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.config import settings
from app.core.database import DEFAULT_SERVICES, Base, get_db
from app.core.security import hash_password, verify_password
from app.main import app
from app.models.booking import Booking
from app.models.service import Service
from app.models.user import User


@pytest.fixture
def test_setup():
    test_engine = create_engine(
        'sqlite://',
        connect_args={'check_same_thread': False},
        poolclass=StaticPool,
    )
    TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
    Base.metadata.create_all(bind=test_engine)

    db = TestingSession()
    db.add_all([Service(**service_data) for service_data in DEFAULT_SERVICES])
    db.add(
        Service(
            name='Inactive Massage',
            slug='inactive-massage',
            short_description='Not available for booking',
            description='Not available for booking',
            price=1000.0,
            duration_minutes=30,
            is_active=False,
        )
    )
    db.commit()
    service = db.query(Service).filter(Service.slug == 'door-step-massage-in-bengaluru').first()

    db.add(
        Booking(
            customer_name='Alice',
            phone='+919845280400',
            email='alice@example.com',
            service_id=service.id,
            booking_date=date(2026, 10, 10),
            booking_time=time(10, 0),
            address='Bengaluru',
            notes='Need spa room',
            status='pending',
        )
    )
    db.add(
        User(
            name='Admin User',
            email='admin@velvettouchspa.in',
            password_hash=hash_password('admin123'),
            role='admin',
        )
    )
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
        yield {'client': test_client, 'session': TestingSession, 'engine': test_engine}
    app.dependency_overrides.pop(get_db, None)


def test_health_check(test_setup):
    response = test_setup['client'].get('/health')
    assert response.status_code == 200
    assert response.json()['status'] == 'ok'


def test_existing_admin_password_is_refreshed_from_settings(monkeypatch):
    from app import core as app_core

    test_engine = create_engine(
        'sqlite://',
        connect_args={'check_same_thread': False},
        poolclass=StaticPool,
    )
    test_session = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
    Base.metadata.create_all(bind=test_engine)

    test_user = User(
        name='Admin User',
        email=settings.admin_email,
        password_hash=hash_password('stale-password'),
        role='admin',
    )
    db = test_session()
    db.add(test_user)
    db.commit()
    db.close()

    monkeypatch.setattr(app_core.database, 'engine', test_engine)
    monkeypatch.setattr(app_core.database, 'SessionLocal', test_session)

    app_core.database.create_db_and_tables()

    refreshed = test_session().query(User).filter(User.email == settings.admin_email).first()
    seeded_slugs = {service.slug for service in test_session().query(Service).all()}
    assert refreshed is not None
    assert verify_password(settings.admin_password, refreshed.password_hash) is True
    assert refreshed.password_hash != hash_password('stale-password')
    assert seeded_slugs == {service['slug'] for service in DEFAULT_SERVICES}


def test_admin_dashboard_endpoints_exist(test_setup):
    client = test_setup['client']
    login_response = client.post('/api/v1/auth/login', json={'email': 'admin@velvettouchspa.in', 'password': 'admin123'})
    assert login_response.status_code == 200
    token = login_response.json()['access_token']
    headers = {'Authorization': f'Bearer {token}'}

    dashboard_response = client.get('/api/v1/admin/dashboard/stats', headers=headers)
    assert dashboard_response.status_code == 200

    bookings_response = client.get('/api/v1/bookings/admin', headers=headers)
    assert bookings_response.status_code == 200


def test_guest_can_submit_a_valid_booking(test_setup):
    client = test_setup['client']
    db = test_setup['session']()
    service = db.query(Service).filter(Service.slug == 'door-step-massage-in-bengaluru').first()
    db.close()

    response = client.post(
        '/api/v1/bookings',
        json={
            'customer_name': 'Priya Sharma',
            'phone': '+919999999999',
            'email': 'priya@example.com',
            'service_id': service.id,
            'booking_date': date.today().isoformat(),
            'booking_time': '14:30',
            'address': '42 MG Road, Bengaluru',
            'notes': 'Please call before arriving.',
        },
    )

    assert response.status_code == 200
    assert response.json()['status'] == 'pending'
    assert response.json()['created_at']

    db = test_setup['session']()
    stored_booking = db.query(Booking).filter(Booking.id == response.json()['id']).first()
    db.close()
    assert stored_booking is not None
    assert stored_booking.customer_name == 'Priya Sharma'


def test_service_api_returns_only_active_services_and_each_can_be_booked(test_setup):
    client = test_setup['client']
    services_response = client.get('/api/v1/services')
    assert services_response.status_code == 200
    services = services_response.json()
    assert all(service['is_active'] for service in services)
    assert 'inactive-massage' not in {service['slug'] for service in services}
    assert {service['slug'] for service in services} == {service['slug'] for service in DEFAULT_SERVICES}
    assert all(service['id'] for service in services)

    for index, service in enumerate(services):
        response = client.post(
            '/api/v1/bookings',
            json={
                'customer_name': f'Customer {index}',
                'phone': f'+9199999900{index}',
                'email': f'customer{index}@example.com',
                'service_id': service['id'],
                'booking_date': date.today().isoformat(),
                'booking_time': '16:00',
                'address': '42 MG Road, Bengaluru',
            },
        )
        assert response.status_code == 200
        assert response.json()['service_id'] == service['id']


def test_booking_validation_and_admin_protection(test_setup):
    client = test_setup['client']
    invalid_booking = client.post(
        '/api/v1/bookings',
        json={
            'customer_name': 'P',
            'phone': 'not-a-phone',
            'email': 'invalid-email',
            'service_id': 999,
            'booking_date': (date.today() - timedelta(days=1)).isoformat(),
            'booking_time': 'invalid-time',
            'address': 'x',
        },
    )
    assert invalid_booking.status_code == 422

    unauthenticated_update = client.patch(
        '/api/v1/admin/bookings/1/status',
        json={'status': 'confirmed'},
    )
    assert unauthenticated_update.status_code == 401


def test_contact_and_service_admin_routes_require_authentication(test_setup):
    client = test_setup['client']
    unauthorized_contact = client.get('/api/v1/contact/admin')
    assert unauthorized_contact.status_code == 401

    unauthorized_create_service = client.post(
        '/api/v1/services',
        json={
            'name': 'Test New Spa Service',
            'slug': 'test-new-spa-service',
            'short_description': 'Test short',
            'description': 'Test full description',
            'price': 1500.0,
            'duration_minutes': 60,
        },
    )
    assert unauthorized_create_service.status_code == 401

    unauthorized_update_service = client.put(
        '/api/v1/services/1',
        json={
            'name': 'Updated Spa Service',
            'short_description': 'Updated short',
            'description': 'Updated description',
            'price': 2000.0,
            'duration_minutes': 90,
        },
    )
    assert unauthorized_update_service.status_code == 401

    unauthorized_delete_service = client.delete('/api/v1/services/1')
    assert unauthorized_delete_service.status_code == 401
