import requests
import time

BASE_URL = "http://localhost:8000"

def test_middleware():
    print("Testing Middleware Setup")
    print("=" * 60)
    
    # Test 1: Request ID
    print("\n1. Testing Request ID...")
    response = requests.get(f"{BASE_URL}/api/test")
    request_id = response.headers.get("X-Request-ID")
    print(f"   Request ID: {request_id}")
    print(f"   ✓ Request ID present" if request_id else "   ✗ Request ID missing")
    
    # Test 2: Security Headers
    print("\n2. Testing Security Headers...")
    headers_to_check = [
        "X-Frame-Options",
        "X-Content-Type-Options",
        "X-XSS-Protection"
    ]
    for header in headers_to_check:
        value = response.headers.get(header)
        print(f"   {header}: {value}")
    
    # Test 3: CORS
    print("\n3. Testing CORS...")
    response = requests.options(
        f"{BASE_URL}/api/test",
        headers={"Origin": "http://localhost:3000"}
    )
    cors_header = response.headers.get("Access-Control-Allow-Origin")
    print(f"   CORS Origin: {cors_header}")
    
    # Test 4: Compression
    print("\n4. Testing Compression...")
    response = requests.get(
        f"{BASE_URL}/api/test",
        headers={"Accept-Encoding": "gzip"}
    )
    encoding = response.headers.get("Content-Encoding")
    print(f"   Content-Encoding: {encoding}")
    
    # Test 5: Process Time
    print("\n5. Testing Process Time...")
    process_time = response.headers.get("X-Process-Time")
    print(f"   Process Time: {process_time}")
    
    print("\n" + "=" * 60)
    print("✓ Middleware tests completed!")

if __name__ == "__main__":
    test_middleware()