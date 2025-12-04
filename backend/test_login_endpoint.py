import httpx
import asyncio

async def test_login():
    url = "http://127.0.0.1:8000/api/auth/login"
    payload = {
        "username": "admin@privateplane.app",
        "password": "ChangeMe123!"
    }
    headers = {
        "Content-Type": "application/x-www-form-urlencoded"
    }
    
    print(f"Sending POST request to {url}...")
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, data=payload, headers=headers)
            print(f"Status Code: {response.status_code}")
            print(f"Response Body: {response.text}")
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_login())
