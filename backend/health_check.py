from fastapi.testclient import TestClient
from app.main import app
print(TestClient(app).get("/health").json())
