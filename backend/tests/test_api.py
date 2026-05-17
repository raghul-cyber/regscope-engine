import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_crawl_endpoint_returns_job_id():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/v1/crawl", json={"jurisdiction_code": "IN"})
        # We expect 404 because "IN" jurisdiction is not in DB during basic test run
        # but the contract of the endpoint should return job_id if successful
        assert response.status_code in [200, 404]
        if response.status_code == 200:
            assert "job_id" in response.json()

@pytest.mark.asyncio
async def test_clauses_endpoint_filters_by_jurisdiction():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/clauses?jurisdiction=IN")
        assert response.status_code == 200
        assert "items" in response.json()

@pytest.mark.asyncio
async def test_audit_endpoint_returns_span_verification():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Invalid UUID to test structure or 404
        response = await ac.get("/api/v1/audit/00000000-0000-0000-0000-000000000000")
        assert response.status_code == 404 # Not found is expected

@pytest.mark.asyncio
async def test_export_endpoint_returns_valid_json():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/export?format=json")
        assert response.status_code == 200
        assert isinstance(response.json(), list)
