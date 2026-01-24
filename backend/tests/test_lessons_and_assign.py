"""
Continental Academy - Lessons and Assign Course API Tests
Tests for: Lessons CRUD, Admin Assign/Remove Course, Bundle Logic, User Lessons
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@serbiana.com"
ADMIN_PASSWORD = "admin123"


class TestLessonsAPI:
    """Tests for Lessons CRUD endpoints"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        return response.json()["token"]
    
    @pytest.fixture
    def test_course_id(self, admin_token):
        """Get or create a test course for lessons"""
        # Get existing courses
        response = requests.get(f"{BASE_URL}/api/courses")
        courses = response.json()
        
        # Find a non-bundle course
        for course in courses:
            if course.get('course_type', 'single') != 'bundle':
                return course['id']
        
        # Create a test course if none exists
        response = requests.post(
            f"{BASE_URL}/api/courses",
            json={
                "title": "TEST_Lesson_Course",
                "description": "Test course for lessons",
                "thumbnail": "https://example.com/thumb.jpg",
                "mux_video_id": "test-mux-id",
                "price": 29.99,
                "is_free": False,
                "order": 99,
                "course_type": "single",
                "included_courses": []
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        return response.json()["id"]
    
    def test_get_course_lessons_empty(self, admin_token, test_course_id):
        """Test GET /api/courses/{id}/lessons returns lessons list (may be empty)"""
        response = requests.get(
            f"{BASE_URL}/api/courses/{test_course_id}/lessons",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET lessons endpoint passed, count: {len(data)}")
    
    def test_create_lesson(self, admin_token, test_course_id):
        """Test POST /api/courses/{id}/lessons creates a lesson"""
        lesson_data = {
            "title": f"TEST_Lesson_{uuid.uuid4().hex[:8]}",
            "mux_video_id": "test-mux-video-123",
            "order": 1
        }
        
        response = requests.post(
            f"{BASE_URL}/api/courses/{test_course_id}/lessons",
            json=lesson_data,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "id" in data
        assert data["title"] == lesson_data["title"]
        assert data["mux_video_id"] == lesson_data["mux_video_id"]
        assert data["course_id"] == test_course_id
        print(f"✓ Create lesson passed: {data['title']}")
        return data["id"]
    
    def test_create_lesson_requires_admin(self, test_course_id):
        """Test creating lesson requires admin authentication"""
        response = requests.post(
            f"{BASE_URL}/api/courses/{test_course_id}/lessons",
            json={"title": "Test", "mux_video_id": "test", "order": 1}
        )
        assert response.status_code == 401
        print("✓ Create lesson correctly requires authentication")
    
    def test_update_lesson(self, admin_token, test_course_id):
        """Test PUT /api/lessons/{id} updates a lesson"""
        # First create a lesson
        create_response = requests.post(
            f"{BASE_URL}/api/courses/{test_course_id}/lessons",
            json={"title": "TEST_Update_Lesson", "mux_video_id": "old-mux-id", "order": 1},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        lesson_id = create_response.json()["id"]
        
        # Update the lesson
        update_data = {
            "title": "TEST_Updated_Lesson",
            "mux_video_id": "new-mux-id",
            "order": 2
        }
        response = requests.put(
            f"{BASE_URL}/api/lessons/{lesson_id}",
            json=update_data,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == update_data["title"]
        assert data["mux_video_id"] == update_data["mux_video_id"]
        print(f"✓ Update lesson passed: {data['title']}")
    
    def test_delete_lesson(self, admin_token, test_course_id):
        """Test DELETE /api/lessons/{id} deletes a lesson"""
        # First create a lesson
        create_response = requests.post(
            f"{BASE_URL}/api/courses/{test_course_id}/lessons",
            json={"title": "TEST_Delete_Lesson", "mux_video_id": "delete-mux-id", "order": 1},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        lesson_id = create_response.json()["id"]
        
        # Delete the lesson
        response = requests.delete(
            f"{BASE_URL}/api/lessons/{lesson_id}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        print(f"✓ Delete lesson passed")
        
        # Verify deletion - lesson should not be in list
        lessons_response = requests.get(
            f"{BASE_URL}/api/courses/{test_course_id}/lessons",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        lessons = lessons_response.json()
        lesson_ids = [l["id"] for l in lessons]
        assert lesson_id not in lesson_ids
        print("✓ Lesson deletion verified")
    
    def test_get_lessons_invalid_course(self, admin_token):
        """Test GET lessons for non-existent course returns 404"""
        response = requests.get(
            f"{BASE_URL}/api/courses/invalid-course-id/lessons",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 404
        print("✓ Invalid course lessons correctly returns 404")


class TestAdminAssignCourse:
    """Tests for Admin Assign/Remove Course endpoints"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json()["token"]
    
    @pytest.fixture
    def test_user(self, admin_token):
        """Create a test user for assignment tests"""
        test_email = f"TEST_assign_{uuid.uuid4().hex[:8]}@test.com"
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": test_email,
            "password": "testpass123",
            "name": "Test Assign User"
        })
        if response.status_code == 200:
            return response.json()["user"]
        # If user exists, get from admin users list
        users_response = requests.get(
            f"{BASE_URL}/api/admin/users",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        users = users_response.json()
        for user in users:
            if user["role"] != "admin":
                return user
        return None
    
    @pytest.fixture
    def test_course(self, admin_token):
        """Get a test course for assignment"""
        response = requests.get(f"{BASE_URL}/api/courses")
        courses = response.json()
        if courses:
            return courses[0]
        return None
    
    def test_assign_course_to_user(self, admin_token, test_user, test_course):
        """Test POST /api/admin/assign-course assigns course to user"""
        if not test_user or not test_course:
            pytest.skip("No test user or course available")
        
        response = requests.post(
            f"{BASE_URL}/api/admin/assign-course",
            json={
                "user_id": test_user["id"],
                "course_id": test_course["id"]
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        # May return 200 (success) or 400 (already assigned)
        assert response.status_code in [200, 400]
        if response.status_code == 200:
            print(f"✓ Assign course passed: {test_course['title']} to {test_user['email']}")
        else:
            print(f"⚠ Course already assigned: {response.json()}")
    
    def test_assign_course_requires_admin(self, test_user, test_course):
        """Test assign course requires admin authentication"""
        if not test_user or not test_course:
            pytest.skip("No test user or course available")
        
        response = requests.post(
            f"{BASE_URL}/api/admin/assign-course",
            json={
                "user_id": test_user["id"],
                "course_id": test_course["id"]
            }
        )
        assert response.status_code == 401
        print("✓ Assign course correctly requires authentication")
    
    def test_get_user_assigned_courses(self, admin_token, test_user):
        """Test GET /api/admin/user-courses/{user_id} returns assigned courses"""
        if not test_user:
            pytest.skip("No test user available")
        
        response = requests.get(
            f"{BASE_URL}/api/admin/user-courses/{test_user['id']}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Get user assigned courses passed, count: {len(data)}")
    
    def test_remove_course_from_user(self, admin_token, test_user, test_course):
        """Test DELETE /api/admin/remove-course/{user_id}/{course_id}"""
        if not test_user or not test_course:
            pytest.skip("No test user or course available")
        
        # First assign the course
        requests.post(
            f"{BASE_URL}/api/admin/assign-course",
            json={
                "user_id": test_user["id"],
                "course_id": test_course["id"]
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        # Then remove it
        response = requests.delete(
            f"{BASE_URL}/api/admin/remove-course/{test_user['id']}/{test_course['id']}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        # May return 200 (success) or 404 (not found)
        assert response.status_code in [200, 404]
        print(f"✓ Remove course endpoint responded with {response.status_code}")
    
    def test_assign_invalid_user(self, admin_token, test_course):
        """Test assign course to invalid user returns 404"""
        if not test_course:
            pytest.skip("No test course available")
        
        response = requests.post(
            f"{BASE_URL}/api/admin/assign-course",
            json={
                "user_id": "invalid-user-id",
                "course_id": test_course["id"]
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 404
        print("✓ Assign to invalid user correctly returns 404")
    
    def test_assign_invalid_course(self, admin_token, test_user):
        """Test assign invalid course returns 404"""
        if not test_user:
            pytest.skip("No test user available")
        
        response = requests.post(
            f"{BASE_URL}/api/admin/assign-course",
            json={
                "user_id": test_user["id"],
                "course_id": "invalid-course-id"
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 404
        print("✓ Assign invalid course correctly returns 404")


class TestUserLessonsAPI:
    """Tests for User Lessons endpoint"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json()["token"]
    
    @pytest.fixture
    def test_user_with_course(self, admin_token):
        """Create a test user and assign a course"""
        # Create user
        test_email = f"TEST_lessons_{uuid.uuid4().hex[:8]}@test.com"
        reg_response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": test_email,
            "password": "testpass123",
            "name": "Test Lessons User"
        })
        if reg_response.status_code != 200:
            pytest.skip("Could not create test user")
        
        user_data = reg_response.json()
        user_token = user_data["token"]
        user_id = user_data["user"]["id"]
        
        # Get a course
        courses_response = requests.get(f"{BASE_URL}/api/courses")
        courses = courses_response.json()
        if not courses:
            pytest.skip("No courses available")
        
        course = courses[0]
        
        # Assign course to user
        requests.post(
            f"{BASE_URL}/api/admin/assign-course",
            json={"user_id": user_id, "course_id": course["id"]},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        return {"token": user_token, "user_id": user_id, "course_id": course["id"]}
    
    def test_get_user_lessons(self, test_user_with_course):
        """Test GET /api/user/lessons returns lessons for user's courses"""
        response = requests.get(
            f"{BASE_URL}/api/user/lessons",
            headers={"Authorization": f"Bearer {test_user_with_course['token']}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Get user lessons passed, courses with lessons: {len(data)}")
        
        # Verify structure if data exists
        if data:
            item = data[0]
            assert "course" in item
            assert "lessons" in item
            print(f"✓ User lessons structure valid")
    
    def test_user_lessons_requires_auth(self):
        """Test user lessons requires authentication"""
        response = requests.get(f"{BASE_URL}/api/user/lessons")
        assert response.status_code == 401
        print("✓ User lessons correctly requires authentication")


class TestBundleCourseLogic:
    """Tests for Bundle Course functionality"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json()["token"]
    
    def test_course_type_field_exists(self):
        """Test courses have course_type field"""
        response = requests.get(f"{BASE_URL}/api/courses")
        assert response.status_code == 200
        courses = response.json()
        
        if courses:
            course = courses[0]
            # course_type should exist (defaults to 'single')
            course_type = course.get('course_type', 'single')
            assert course_type in ['single', 'bundle']
            print(f"✓ Course type field exists: {course_type}")
    
    def test_create_bundle_course(self, admin_token):
        """Test creating a bundle course with included_courses"""
        # Get existing courses for bundle
        courses_response = requests.get(f"{BASE_URL}/api/courses")
        courses = courses_response.json()
        
        # Get non-bundle course IDs
        single_course_ids = [c["id"] for c in courses if c.get("course_type", "single") != "bundle"][:2]
        
        if len(single_course_ids) < 1:
            pytest.skip("Not enough single courses for bundle test")
        
        bundle_data = {
            "title": f"TEST_Bundle_{uuid.uuid4().hex[:8]}",
            "description": "Test bundle course",
            "thumbnail": "https://example.com/bundle.jpg",
            "mux_video_id": "bundle-mux-id",
            "price": 99.99,
            "is_free": False,
            "order": 100,
            "course_type": "bundle",
            "included_courses": single_course_ids
        }
        
        response = requests.post(
            f"{BASE_URL}/api/courses",
            json=bundle_data,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data["course_type"] == "bundle"
        assert data["included_courses"] == single_course_ids
        print(f"✓ Create bundle course passed: {data['title']}")
        
        # Cleanup - delete the test bundle
        requests.delete(
            f"{BASE_URL}/api/courses/{data['id']}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
    
    def test_update_course_to_bundle(self, admin_token):
        """Test updating a course to bundle type"""
        # Create a single course first
        create_response = requests.post(
            f"{BASE_URL}/api/courses",
            json={
                "title": f"TEST_ToBundleCourse_{uuid.uuid4().hex[:8]}",
                "description": "Test course to convert to bundle",
                "thumbnail": "https://example.com/thumb.jpg",
                "mux_video_id": "test-mux",
                "price": 29.99,
                "is_free": False,
                "order": 101,
                "course_type": "single",
                "included_courses": []
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        course_id = create_response.json()["id"]
        
        # Get other courses for bundle
        courses_response = requests.get(f"{BASE_URL}/api/courses")
        courses = courses_response.json()
        other_course_ids = [c["id"] for c in courses if c["id"] != course_id and c.get("course_type", "single") != "bundle"][:1]
        
        # Update to bundle
        update_response = requests.put(
            f"{BASE_URL}/api/courses/{course_id}",
            json={
                "course_type": "bundle",
                "included_courses": other_course_ids
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert update_response.status_code == 200
        data = update_response.json()
        assert data["course_type"] == "bundle"
        print(f"✓ Update course to bundle passed")
        
        # Cleanup
        requests.delete(
            f"{BASE_URL}/api/courses/{course_id}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )


class TestUserCoursesAPI:
    """Tests for User Courses endpoint"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json()["token"]
    
    def test_get_user_courses(self, admin_token):
        """Test GET /api/user/courses returns user's purchased courses"""
        response = requests.get(
            f"{BASE_URL}/api/user/courses",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Get user courses passed, count: {len(data)}")
    
    def test_user_courses_requires_auth(self):
        """Test user courses requires authentication"""
        response = requests.get(f"{BASE_URL}/api/user/courses")
        assert response.status_code == 401
        print("✓ User courses correctly requires authentication")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
