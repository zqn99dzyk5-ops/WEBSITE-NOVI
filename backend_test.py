import requests
import sys
import json
from datetime import datetime

class ContinentalAcademyTester:
    def __init__(self, base_url="https://serbiana-premium.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.admin_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
            self.failed_tests.append({"test": name, "error": details})

    def make_request(self, method, endpoint, data=None, headers=None, expected_status=200):
        """Make HTTP request and return response"""
        url = f"{self.api_url}/{endpoint}"
        default_headers = {'Content-Type': 'application/json'}
        if headers:
            default_headers.update(headers)
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=default_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=default_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=default_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=default_headers, timeout=10)
            
            success = response.status_code == expected_status
            return success, response
        except Exception as e:
            return False, str(e)

    def test_api_root(self):
        """Test API root endpoint"""
        success, response = self.make_request('GET', '')
        if success:
            try:
                data = response.json()
                success = "Continental Academy API" in data.get('message', '')
                self.log_test("API Root", success, "" if success else f"Unexpected response: {data}")
            except:
                self.log_test("API Root", False, "Invalid JSON response")
        else:
            self.log_test("API Root", False, f"Request failed: {response}")

    def test_settings_endpoint(self):
        """Test settings endpoint"""
        success, response = self.make_request('GET', 'settings')
        if success:
            try:
                data = response.json()
                required_fields = ['hero_title', 'hero_subtitle', 'stats_members']
                has_fields = all(field in data for field in required_fields)
                self.log_test("Settings Endpoint", has_fields, "" if has_fields else f"Missing fields in response")
            except:
                self.log_test("Settings Endpoint", False, "Invalid JSON response")
        else:
            self.log_test("Settings Endpoint", False, f"Request failed: {response}")

    def test_courses_endpoint(self):
        """Test courses endpoint"""
        success, response = self.make_request('GET', 'courses')
        if success:
            try:
                data = response.json()
                is_list = isinstance(data, list)
                self.log_test("Courses Endpoint", is_list, "" if is_list else f"Expected list, got: {type(data)}")
                return data if is_list else []
            except:
                self.log_test("Courses Endpoint", False, "Invalid JSON response")
                return []
        else:
            self.log_test("Courses Endpoint", False, f"Request failed: {response}")
            return []

    def test_faq_endpoint(self):
        """Test FAQ endpoint"""
        success, response = self.make_request('GET', 'faq')
        if success:
            try:
                data = response.json()
                is_list = isinstance(data, list)
                self.log_test("FAQ Endpoint", is_list, "" if is_list else f"Expected list, got: {type(data)}")
            except:
                self.log_test("FAQ Endpoint", False, "Invalid JSON response")
        else:
            self.log_test("FAQ Endpoint", False, f"Request failed: {response}")

    def test_results_endpoint(self):
        """Test results endpoint"""
        success, response = self.make_request('GET', 'results')
        if success:
            try:
                data = response.json()
                is_list = isinstance(data, list)
                self.log_test("Results Endpoint", is_list, "" if is_list else f"Expected list, got: {type(data)}")
            except:
                self.log_test("Results Endpoint", False, "Invalid JSON response")
        else:
            self.log_test("Results Endpoint", False, f"Request failed: {response}")

    def test_user_registration(self):
        """Test user registration"""
        test_user = {
            "email": f"test_{datetime.now().strftime('%H%M%S')}@test.com",
            "password": "TestPass123!",
            "name": "Test User"
        }
        
        success, response = self.make_request('POST', 'auth/register', test_user, expected_status=200)
        if success:
            try:
                data = response.json()
                has_token = 'token' in data and 'user' in data
                self.log_test("User Registration", has_token, "" if has_token else f"Missing token or user in response")
                if has_token:
                    self.token = data['token']
                    return data['user']
            except:
                self.log_test("User Registration", False, "Invalid JSON response")
        else:
            self.log_test("User Registration", False, f"Request failed: {response}")
        return None

    def test_admin_login(self):
        """Test admin login"""
        admin_creds = {
            "email": "admin@serbiana.com",
            "password": "admin123"
        }
        
        success, response = self.make_request('POST', 'auth/login', admin_creds, expected_status=200)
        if success:
            try:
                data = response.json()
                has_token = 'token' in data and 'user' in data
                is_admin = data.get('user', {}).get('role') == 'admin' if has_token else False
                self.log_test("Admin Login", has_token and is_admin, 
                            "" if has_token and is_admin else f"Login failed or not admin role")
                if has_token:
                    self.admin_token = data['token']
                    return data['user']
            except:
                self.log_test("Admin Login", False, "Invalid JSON response")
        else:
            self.log_test("Admin Login", False, f"Request failed: {response}")
        return None

    def test_protected_endpoints(self):
        """Test protected endpoints with admin token"""
        if not self.admin_token:
            self.log_test("Admin Stats", False, "No admin token available")
            return
        
        headers = {'Authorization': f'Bearer {self.admin_token}'}
        
        # Test admin stats
        success, response = self.make_request('GET', 'admin/stats', headers=headers)
        if success:
            try:
                data = response.json()
                required_fields = ['total_users', 'active_subscriptions', 'total_courses']
                has_fields = all(field in data for field in required_fields)
                self.log_test("Admin Stats", has_fields, "" if has_fields else f"Missing required fields")
            except:
                self.log_test("Admin Stats", False, "Invalid JSON response")
        else:
            self.log_test("Admin Stats", False, f"Request failed: {response}")

        # Test admin users
        success, response = self.make_request('GET', 'admin/users', headers=headers)
        if success:
            try:
                data = response.json()
                is_list = isinstance(data, list)
                self.log_test("Admin Users", is_list, "" if is_list else f"Expected list, got: {type(data)}")
            except:
                self.log_test("Admin Users", False, "Invalid JSON response")
        else:
            self.log_test("Admin Users", False, f"Request failed: {response}")

    def test_contact_form(self):
        """Test contact form submission"""
        contact_data = {
            "name": "Test User",
            "email": "test@example.com",
            "subject": "Test Subject",
            "message": "This is a test message"
        }
        
        success, response = self.make_request('POST', 'contact', contact_data, expected_status=200)
        if success:
            try:
                data = response.json()
                has_message = 'message' in data
                self.log_test("Contact Form", has_message, "" if has_message else f"No confirmation message")
            except:
                self.log_test("Contact Form", False, "Invalid JSON response")
        else:
            self.log_test("Contact Form", False, f"Request failed: {response}")

    def run_all_tests(self):
        """Run all backend tests"""
        print(f"🚀 Starting Continental Academy Backend Tests")
        print(f"📍 Testing API: {self.api_url}")
        print("=" * 60)
        
        # Basic API tests
        self.test_api_root()
        self.test_settings_endpoint()
        courses = self.test_courses_endpoint()
        self.test_faq_endpoint()
        self.test_results_endpoint()
        
        # Auth tests
        user = self.test_user_registration()
        admin = self.test_admin_login()
        
        # Protected endpoints
        self.test_protected_endpoints()
        
        # Contact form
        self.test_contact_form()
        
        # Summary
        print("=" * 60)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.failed_tests:
            print("\n❌ Failed Tests:")
            for test in self.failed_tests:
                print(f"  - {test['test']}: {test['error']}")
        
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"✨ Success Rate: {success_rate:.1f}%")
        
        return {
            "total_tests": self.tests_run,
            "passed_tests": self.tests_passed,
            "failed_tests": self.failed_tests,
            "success_rate": success_rate
        }

def main():
    tester = ContinentalAcademyTester()
    results = tester.run_all_tests()
    
    # Return appropriate exit code
    return 0 if results["success_rate"] >= 80 else 1

if __name__ == "__main__":
    sys.exit(main())