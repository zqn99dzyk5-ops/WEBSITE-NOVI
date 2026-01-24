"""
Continental Academy API Tests
Tests for: Auth, Shop, Courses, FAQ, Results, Settings, Admin endpoints
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@serbiana.com"
ADMIN_PASSWORD = "admin123"
TEST_USER_EMAIL = f"TEST_user_{uuid.uuid4().hex[:8]}@test.com"
TEST_USER_PASSWORD = "testpass123"
TEST_USER_NAME = "Test User"


class TestHealthAndSettings:
    """Basic health and settings endpoint tests"""
    
    def test_health_endpoint(self):
        """Test health check endpoint - may not be implemented"""
        response = requests.get(f"{BASE_URL}/api/health")
        # Health endpoint may not exist, skip if 404
        if response.status_code == 404:
            print("⚠ Health endpoint not implemented (404)")
            return
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "healthy"
        print(f"✓ Health check passed: {data}")
    
    def test_settings_endpoint(self):
        """Test settings endpoint returns site configuration"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        data = response.json()
        # Verify key settings fields exist
        assert "hero_title" in data
        assert "hero_subtitle" in data
        assert "discord_link" in data
        assert "intro_video_mux_id" in data  # New field for Mux video
        print(f"✓ Settings endpoint passed, hero_title: {data.get('hero_title')}")


class TestAuthentication:
    """Authentication flow tests"""
    
    def test_admin_login_success(self):
        """Test admin login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "user" in data
        assert data["user"]["email"] == ADMIN_EMAIL
        assert data["user"]["role"] == "admin"
        print(f"✓ Admin login successful, role: {data['user']['role']}")
        return data["token"]
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials returns 401"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "wrong@example.com",
            "password": "wrongpass"
        })
        assert response.status_code == 401
        print("✓ Invalid login correctly rejected with 401")
    
    def test_user_registration(self):
        """Test new user registration"""
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD,
            "name": TEST_USER_NAME
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "user" in data
        assert data["user"]["email"] == TEST_USER_EMAIL
        assert data["user"]["role"] == "user"
        print(f"✓ User registration successful: {TEST_USER_EMAIL}")
        return data["token"]
    
    def test_get_current_user(self):
        """Test /auth/me endpoint with valid token"""
        # First login
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        token = login_response.json()["token"]
        
        # Get current user
        response = requests.get(f"{BASE_URL}/api/auth/me", headers={
            "Authorization": f"Bearer {token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == ADMIN_EMAIL
        print(f"✓ Get current user passed: {data['email']}")


class TestShopEndpoints:
    """Shop product endpoints tests"""
    
    def test_get_shop_products(self):
        """Test GET /api/shop returns products list"""
        response = requests.get(f"{BASE_URL}/api/shop")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Shop products endpoint passed, count: {len(data)}")
        return data
    
    def test_shop_product_structure(self):
        """Test shop product has required fields"""
        response = requests.get(f"{BASE_URL}/api/shop")
        assert response.status_code == 200
        data = response.json()
        
        if len(data) > 0:
            product = data[0]
            required_fields = ["id", "title", "description", "thumbnail", "platform", "price", "features", "in_stock"]
            for field in required_fields:
                assert field in product, f"Missing field: {field}"
            assert product["platform"] in ["youtube", "tiktok", "facebook"]
            print(f"✓ Shop product structure valid: {product['title']}")
        else:
            print("⚠ No shop products found to validate structure")


class TestShopCheckout:
    """Shop checkout endpoint tests (Stripe integration)"""
    
    def test_checkout_requires_auth(self):
        """Test checkout endpoint requires authentication"""
        response = requests.post(f"{BASE_URL}/api/checkout/shop-product", json={
            "product_id": "test-id",
            "origin_url": "https://example.com"
        })
        assert response.status_code == 401
        print("✓ Checkout correctly requires authentication")
    
    def test_checkout_with_auth(self):
        """Test checkout endpoint with valid auth creates session"""
        # Login first
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        token = login_response.json()["token"]
        
        # Get a product
        products_response = requests.get(f"{BASE_URL}/api/shop")
        products = products_response.json()
        
        if len(products) > 0:
            product = products[0]
            # Try checkout
            response = requests.post(
                f"{BASE_URL}/api/checkout/shop-product",
                json={
                    "product_id": product["id"],
                    "origin_url": "https://balkanstudy.preview.emergentagent.com"
                },
                headers={"Authorization": f"Bearer {token}"}
            )
            # Should return checkout URL or error if product not in stock
            assert response.status_code in [200, 400]
            if response.status_code == 200:
                data = response.json()
                assert "url" in data
                print(f"✓ Checkout session created: {data['url'][:50]}...")
            else:
                print(f"⚠ Checkout returned 400: {response.json()}")
        else:
            print("⚠ No products available for checkout test")
    
    def test_checkout_invalid_product(self):
        """Test checkout with invalid product ID"""
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        token = login_response.json()["token"]
        
        response = requests.post(
            f"{BASE_URL}/api/checkout/shop-product",
            json={
                "product_id": "invalid-product-id",
                "origin_url": "https://example.com"
            },
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 404
        print("✓ Invalid product checkout correctly returns 404")


class TestCoursesEndpoints:
    """Courses CRUD endpoints tests"""
    
    def test_get_courses(self):
        """Test GET /api/courses returns courses list"""
        response = requests.get(f"{BASE_URL}/api/courses")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Courses endpoint passed, count: {len(data)}")
        return data
    
    def test_course_structure(self):
        """Test course has required fields"""
        response = requests.get(f"{BASE_URL}/api/courses")
        data = response.json()
        
        if len(data) > 0:
            course = data[0]
            required_fields = ["id", "title", "description", "thumbnail", "mux_video_id", "price"]
            for field in required_fields:
                assert field in course, f"Missing field: {field}"
            print(f"✓ Course structure valid: {course['title']}")
        else:
            print("⚠ No courses found to validate structure")


class TestFAQEndpoints:
    """FAQ endpoints tests"""
    
    def test_get_faqs(self):
        """Test GET /api/faq returns FAQ list"""
        response = requests.get(f"{BASE_URL}/api/faq")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ FAQ endpoint passed, count: {len(data)}")
    
    def test_faq_structure(self):
        """Test FAQ has required fields"""
        response = requests.get(f"{BASE_URL}/api/faq")
        data = response.json()
        
        if len(data) > 0:
            faq = data[0]
            assert "id" in faq
            assert "question" in faq
            assert "answer" in faq
            print(f"✓ FAQ structure valid: {faq['question'][:30]}...")


class TestResultsEndpoints:
    """Results endpoints tests"""
    
    def test_get_results(self):
        """Test GET /api/results returns results list"""
        response = requests.get(f"{BASE_URL}/api/results")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Results endpoint passed, count: {len(data)}")


class TestAdminEndpoints:
    """Admin panel endpoints tests"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json()["token"]
    
    def test_admin_stats(self, admin_token):
        """Test admin stats endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/admin/stats",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "total_users" in data
        assert "total_courses" in data
        assert "active_subscriptions" in data
        print(f"✓ Admin stats passed: {data['total_users']} users, {data['total_courses']} courses")
    
    def test_admin_users_list(self, admin_token):
        """Test admin users list endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/admin/users",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Admin users list passed, count: {len(data)}")
    
    def test_admin_messages(self, admin_token):
        """Test admin messages endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/admin/messages",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Admin messages passed, count: {len(data)}")
    
    def test_admin_requires_auth(self):
        """Test admin endpoints require authentication"""
        response = requests.get(f"{BASE_URL}/api/admin/stats")
        assert response.status_code == 401
        print("✓ Admin endpoints correctly require authentication")
    
    def test_admin_requires_admin_role(self):
        """Test admin endpoints require admin role"""
        # Register a regular user
        test_email = f"TEST_regular_{uuid.uuid4().hex[:8]}@test.com"
        reg_response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": test_email,
            "password": "testpass123",
            "name": "Regular User"
        })
        if reg_response.status_code == 200:
            user_token = reg_response.json()["token"]
            
            # Try to access admin endpoint
            response = requests.get(
                f"{BASE_URL}/api/admin/stats",
                headers={"Authorization": f"Bearer {user_token}"}
            )
            assert response.status_code == 403
            print("✓ Admin endpoints correctly reject non-admin users")
        else:
            print("⚠ Could not create test user for admin role test")


class TestSettingsUpdate:
    """Settings update tests (admin only)"""
    
    def test_update_settings_requires_admin(self):
        """Test settings update requires admin role"""
        response = requests.put(f"{BASE_URL}/api/settings", json={
            "hero_title": "Test Title"
        })
        assert response.status_code == 401
        print("✓ Settings update correctly requires authentication")
    
    def test_update_settings_with_admin(self):
        """Test admin can update settings including intro_video_mux_id"""
        # Login as admin
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        token = login_response.json()["token"]
        
        # Get current settings
        current_settings = requests.get(f"{BASE_URL}/api/settings").json()
        
        # Update with intro_video_mux_id
        update_data = {
            **current_settings,
            "intro_video_mux_id": "test-mux-id-123"
        }
        
        response = requests.put(
            f"{BASE_URL}/api/settings",
            json=update_data,
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        
        # Verify update
        updated_settings = requests.get(f"{BASE_URL}/api/settings").json()
        assert updated_settings.get("intro_video_mux_id") == "test-mux-id-123"
        print("✓ Settings update with intro_video_mux_id passed")
        
        # Restore original
        restore_data = {
            **current_settings,
            "intro_video_mux_id": current_settings.get("intro_video_mux_id", "")
        }
        requests.put(
            f"{BASE_URL}/api/settings",
            json=restore_data,
            headers={"Authorization": f"Bearer {token}"}
        )


class TestContactEndpoint:
    """Contact form endpoint tests"""
    
    def test_contact_submission(self):
        """Test contact form submission"""
        response = requests.post(f"{BASE_URL}/api/contact", json={
            "name": "Test User",
            "email": "test@example.com",
            "subject": "Test Subject",
            "message": "This is a test message"
        })
        assert response.status_code == 200
        data = response.json()
        # API returns either 'id' or 'message' on success
        assert "id" in data or "message" in data
        print(f"✓ Contact submission passed: {data}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
