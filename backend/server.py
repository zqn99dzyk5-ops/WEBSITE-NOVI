from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
from emergentintegrations.payments.stripe.checkout import (
    StripeCheckout, 
    CheckoutSessionResponse, 
    CheckoutStatusResponse, 
    CheckoutSessionRequest
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Config
JWT_SECRET = os.environ.get('JWT_SECRET', 'continental-academy-secret-key-2024')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24

# Stripe Config
STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY', 'sk_test_emergent')

app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer(auto_error=False)

# ============= MODELS =============

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: str
    name: str
    role: str
    subscription_status: str
    created_at: str

class LessonCreate(BaseModel):
    title: str
    mux_video_id: str
    order: int = 0

class LessonResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    course_id: str
    title: str
    mux_video_id: str
    order: int

class CourseCreate(BaseModel):
    title: str
    description: str
    thumbnail: str
    mux_video_id: str
    price: float
    is_free: bool = False
    order: int = 0
    course_type: str = "single"  # single, bundle
    included_courses: List[str] = []  # For bundles - list of course IDs included

class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    thumbnail: Optional[str] = None
    mux_video_id: Optional[str] = None
    price: Optional[float] = None
    is_free: Optional[bool] = None
    order: Optional[int] = None
    course_type: Optional[str] = None
    included_courses: Optional[List[str]] = None

class CourseResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    title: str
    description: str
    thumbnail: str
    mux_video_id: str
    price: float
    is_free: bool
    order: int
    course_type: str = "single"
    included_courses: List[str] = []
    created_at: str

class AssignCourseRequest(BaseModel):
    user_id: str
    course_id: str

class FAQCreate(BaseModel):
    question: str
    answer: str
    order: int = 0

class FAQResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    question: str
    answer: str
    order: int

class ResultCreate(BaseModel):
    image: str
    text: str
    order: int = 0

class ResultResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    image: str
    text: str
    order: int

class SiteSettings(BaseModel):
    hero_title: str = "Zaradi Sa Nama"
    hero_subtitle: str = "Nauči vještine koje će promijeniti tvoj život"
    hero_image: str = "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1920"
    intro_video_mux_id: str = ""
    why_us_title: str = "Zašto Continental Academy?"
    why_us_points: List[str] = []
    stats_members: int = 1500
    stats_projects: int = 350
    stats_courses: int = 12
    discord_link: str = "https://discord.gg/continentall"
    support_text: str = "Support nam je 24/7"
    footer_text: str = "© 2024 Continental Academy. Sva prava zadržana."
    nav_links: List[Dict[str, str]] = []
    pricing_plans: List[Dict[str, Any]] = []

class ShopProductCreate(BaseModel):
    title: str
    description: str
    thumbnail: str
    platform: str  # youtube, tiktok, facebook
    price: float
    features: List[str] = []
    in_stock: bool = True
    order: int = 0

class ShopProductResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    title: str
    description: str
    thumbnail: str
    platform: str
    price: float
    features: List[str]
    in_stock: bool
    order: int
    created_at: str

class PaymentCreate(BaseModel):
    plan_id: str
    origin_url: str

class CoursePurchase(BaseModel):
    course_id: str
    origin_url: str

class ShopProductPurchase(BaseModel):
    product_id: str
    origin_url: str

class ContactMessage(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str

# ============= AUTH HELPERS =============

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, role: str) -> str:
    payload = {
        'user_id': user_id,
        'role': role,
        'exp': datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token istekao")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Nevažeći token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Niste prijavljeni")
    payload = decode_token(credentials.credentials)
    user = await db.users.find_one({"id": payload['user_id']}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Korisnik nije pronađen")
    return user

async def get_admin_user(user: dict = Depends(get_current_user)):
    if user.get('role') != 'admin':
        raise HTTPException(status_code=403, detail="Nemate admin pristup")
    return user

async def get_optional_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        return None
    try:
        payload = decode_token(credentials.credentials)
        user = await db.users.find_one({"id": payload['user_id']}, {"_id": 0})
        return user
    except:
        return None

# ============= AUTH ROUTES =============

@api_router.post("/auth/register")
async def register(data: UserCreate):
    existing = await db.users.find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email već postoji")
    
    user_id = str(uuid.uuid4())
    user = {
        "id": user_id,
        "email": data.email,
        "password": hash_password(data.password),
        "name": data.name,
        "role": "user",
        "subscription_status": "inactive",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user)
    
    token = create_token(user_id, "user")
    return {
        "token": token,
        "user": {
            "id": user_id,
            "email": data.email,
            "name": data.name,
            "role": "user",
            "subscription_status": "inactive"
        }
    }

@api_router.post("/auth/login")
async def login(data: UserLogin):
    user = await db.users.find_one({"email": data.email}, {"_id": 0})
    if not user or not verify_password(data.password, user['password']):
        raise HTTPException(status_code=401, detail="Pogrešan email ili lozinka")
    
    token = create_token(user['id'], user['role'])
    return {
        "token": token,
        "user": {
            "id": user['id'],
            "email": user['email'],
            "name": user['name'],
            "role": user['role'],
            "subscription_status": user['subscription_status']
        }
    }

@api_router.get("/auth/me")
async def get_me(user: dict = Depends(get_current_user)):
    return {
        "id": user['id'],
        "email": user['email'],
        "name": user['name'],
        "role": user['role'],
        "subscription_status": user['subscription_status']
    }

# ============= COURSES ROUTES =============

@api_router.get("/courses", response_model=List[CourseResponse])
async def get_courses():
    courses = await db.courses.find({}, {"_id": 0}).sort("order", 1).to_list(100)
    return courses

@api_router.get("/courses/{course_id}")
async def get_course(course_id: str, user: dict = Depends(get_optional_user)):
    course = await db.courses.find_one({"id": course_id}, {"_id": 0})
    if not course:
        raise HTTPException(status_code=404, detail="Kurs nije pronađen")
    
    can_access = course.get('is_free', False)
    if user and user.get('subscription_status') == 'active':
        can_access = True
    if user and user.get('role') == 'admin':
        can_access = True
    
    return {**course, "can_access": can_access}

@api_router.post("/courses", response_model=CourseResponse)
async def create_course(data: CourseCreate, admin: dict = Depends(get_admin_user)):
    course_id = str(uuid.uuid4())
    course = {
        "id": course_id,
        **data.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.courses.insert_one(course)
    return CourseResponse(**course)

@api_router.put("/courses/{course_id}")
async def update_course(course_id: str, data: CourseUpdate, admin: dict = Depends(get_admin_user)):
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="Nema podataka za ažuriranje")
    
    result = await db.courses.update_one({"id": course_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Kurs nije pronađen")
    
    course = await db.courses.find_one({"id": course_id}, {"_id": 0})
    return course

@api_router.delete("/courses/{course_id}")
async def delete_course(course_id: str, admin: dict = Depends(get_admin_user)):
    result = await db.courses.delete_one({"id": course_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Kurs nije pronađen")
    # Also delete all lessons for this course
    await db.lessons.delete_many({"course_id": course_id})
    return {"message": "Kurs obrisan"}

# ============= LESSONS ROUTES =============

@api_router.get("/courses/{course_id}/lessons")
async def get_course_lessons(course_id: str, user: dict = Depends(get_optional_user)):
    """Get all lessons for a course"""
    # Check if course exists
    course = await db.courses.find_one({"id": course_id}, {"_id": 0})
    if not course:
        raise HTTPException(status_code=404, detail="Kurs nije pronađen")
    
    # Check access
    can_access = course.get('is_free', False)
    if user:
        if user.get('role') == 'admin':
            can_access = True
        elif user.get('subscription_status') == 'active':
            can_access = True
        else:
            # Check if user purchased this course or a bundle containing it
            user_courses = await db.user_courses.find({"user_id": user['id']}, {"_id": 0}).to_list(100)
            user_course_ids = [uc['course_id'] for uc in user_courses]
            
            if course_id in user_course_ids:
                can_access = True
            else:
                # Check if user has a bundle that includes this course
                for uc_id in user_course_ids:
                    bundle = await db.courses.find_one({"id": uc_id, "course_type": "bundle"}, {"_id": 0})
                    if bundle and course_id in bundle.get('included_courses', []):
                        can_access = True
                        break
    
    if not can_access:
        raise HTTPException(status_code=403, detail="Nemate pristup ovom kursu")
    
    lessons = await db.lessons.find({"course_id": course_id}, {"_id": 0}).sort("order", 1).to_list(100)
    return lessons

@api_router.post("/courses/{course_id}/lessons")
async def create_lesson(course_id: str, data: LessonCreate, admin: dict = Depends(get_admin_user)):
    """Create a new lesson for a course"""
    # Verify course exists
    course = await db.courses.find_one({"id": course_id})
    if not course:
        raise HTTPException(status_code=404, detail="Kurs nije pronađen")
    
    lesson_id = str(uuid.uuid4())
    lesson = {
        "id": lesson_id,
        "course_id": course_id,
        **data.model_dump()
    }
    await db.lessons.insert_one(lesson)
    return LessonResponse(**lesson)

@api_router.put("/lessons/{lesson_id}")
async def update_lesson(lesson_id: str, data: LessonCreate, admin: dict = Depends(get_admin_user)):
    """Update a lesson"""
    result = await db.lessons.update_one({"id": lesson_id}, {"$set": data.model_dump()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Lekcija nije pronađena")
    lesson = await db.lessons.find_one({"id": lesson_id}, {"_id": 0})
    return lesson

@api_router.delete("/lessons/{lesson_id}")
async def delete_lesson(lesson_id: str, admin: dict = Depends(get_admin_user)):
    """Delete a lesson"""
    result = await db.lessons.delete_one({"id": lesson_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Lekcija nije pronađena")
    return {"message": "Lekcija obrisana"}

@api_router.get("/user/lessons")
async def get_user_lessons(user: dict = Depends(get_current_user)):
    """Get all lessons accessible to the current user based on their purchased courses"""
    # Get user's purchased courses
    user_courses = await db.user_courses.find({"user_id": user['id']}, {"_id": 0}).to_list(100)
    accessible_course_ids = set()
    
    for uc in user_courses:
        course_id = uc['course_id']
        accessible_course_ids.add(course_id)
        
        # Check if it's a bundle and add included courses
        course = await db.courses.find_one({"id": course_id}, {"_id": 0})
        if course and course.get('course_type') == 'bundle':
            for included_id in course.get('included_courses', []):
                accessible_course_ids.add(included_id)
    
    # Get all lessons for accessible courses
    lessons_with_courses = []
    for course_id in accessible_course_ids:
        course = await db.courses.find_one({"id": course_id}, {"_id": 0})
        if course:
            lessons = await db.lessons.find({"course_id": course_id}, {"_id": 0}).sort("order", 1).to_list(100)
            if lessons:
                lessons_with_courses.append({
                    "course": course,
                    "lessons": lessons
                })
    
    return lessons_with_courses

# ============= ADMIN ASSIGN COURSE =============

@api_router.post("/admin/assign-course")
async def admin_assign_course(data: AssignCourseRequest, admin: dict = Depends(get_admin_user)):
    """Admin can manually assign a course to a user"""
    # Check if user exists
    user = await db.users.find_one({"id": data.user_id})
    if not user:
        raise HTTPException(status_code=404, detail="Korisnik nije pronađen")
    
    # Check if course exists
    course = await db.courses.find_one({"id": data.course_id})
    if not course:
        raise HTTPException(status_code=404, detail="Kurs nije pronađen")
    
    # Check if already assigned
    existing = await db.user_courses.find_one({"user_id": data.user_id, "course_id": data.course_id})
    if existing:
        raise HTTPException(status_code=400, detail="Korisnik već ima ovaj kurs")
    
    # Assign course
    await db.user_courses.insert_one({
        "user_id": data.user_id,
        "course_id": data.course_id,
        "assigned_by_admin": True,
        "purchased_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {"message": f"Kurs '{course['title']}' dodijeljen korisniku {user['email']}"}

@api_router.delete("/admin/remove-course/{user_id}/{course_id}")
async def admin_remove_course(user_id: str, course_id: str, admin: dict = Depends(get_admin_user)):
    """Admin can remove a course from a user"""
    result = await db.user_courses.delete_one({"user_id": user_id, "course_id": course_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Kurs nije pronađen za ovog korisnika")
    return {"message": "Kurs uklonjen od korisnika"}

@api_router.get("/admin/user-courses/{user_id}")
async def get_user_assigned_courses(user_id: str, admin: dict = Depends(get_admin_user)):
    """Get all courses assigned to a specific user"""
    user_courses = await db.user_courses.find({"user_id": user_id}, {"_id": 0}).to_list(100)
    course_ids = [uc['course_id'] for uc in user_courses]
    
    courses = []
    for course_id in course_ids:
        course = await db.courses.find_one({"id": course_id}, {"_id": 0})
        if course:
            courses.append(course)
    
    return courses

# ============= FAQ ROUTES =============

@api_router.get("/faq", response_model=List[FAQResponse])
async def get_faqs():
    faqs = await db.faqs.find({}, {"_id": 0}).sort("order", 1).to_list(100)
    return faqs

@api_router.post("/faq", response_model=FAQResponse)
async def create_faq(data: FAQCreate, admin: dict = Depends(get_admin_user)):
    faq_id = str(uuid.uuid4())
    faq = {"id": faq_id, **data.model_dump()}
    await db.faqs.insert_one(faq)
    return FAQResponse(**faq)

@api_router.put("/faq/{faq_id}")
async def update_faq(faq_id: str, data: FAQCreate, admin: dict = Depends(get_admin_user)):
    result = await db.faqs.update_one({"id": faq_id}, {"$set": data.model_dump()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="FAQ nije pronađen")
    faq = await db.faqs.find_one({"id": faq_id}, {"_id": 0})
    return faq

@api_router.delete("/faq/{faq_id}")
async def delete_faq(faq_id: str, admin: dict = Depends(get_admin_user)):
    result = await db.faqs.delete_one({"id": faq_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="FAQ nije pronađen")
    return {"message": "FAQ obrisan"}

# ============= RESULTS ROUTES =============

@api_router.get("/results", response_model=List[ResultResponse])
async def get_results():
    results = await db.results.find({}, {"_id": 0}).sort("order", 1).to_list(100)
    return results

@api_router.post("/results", response_model=ResultResponse)
async def create_result(data: ResultCreate, admin: dict = Depends(get_admin_user)):
    result_id = str(uuid.uuid4())
    result = {"id": result_id, **data.model_dump()}
    await db.results.insert_one(result)
    return ResultResponse(**result)

@api_router.put("/results/{result_id}")
async def update_result(result_id: str, data: ResultCreate, admin: dict = Depends(get_admin_user)):
    res = await db.results.update_one({"id": result_id}, {"$set": data.model_dump()})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Rezultat nije pronađen")
    result = await db.results.find_one({"id": result_id}, {"_id": 0})
    return result

@api_router.delete("/results/{result_id}")
async def delete_result(result_id: str, admin: dict = Depends(get_admin_user)):
    result = await db.results.delete_one({"id": result_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Rezultat nije pronađen")
    return {"message": "Rezultat obrisan"}

# ============= SHOP ROUTES =============

@api_router.get("/shop", response_model=List[ShopProductResponse])
async def get_shop_products():
    products = await db.shop_products.find({}, {"_id": 0}).sort("order", 1).to_list(100)
    return products

@api_router.get("/shop/{product_id}")
async def get_shop_product(product_id: str):
    product = await db.shop_products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Proizvod nije pronađen")
    return product

@api_router.post("/shop", response_model=ShopProductResponse)
async def create_shop_product(data: ShopProductCreate, admin: dict = Depends(get_admin_user)):
    product_id = str(uuid.uuid4())
    product = {
        "id": product_id,
        **data.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.shop_products.insert_one(product)
    return ShopProductResponse(**product)

@api_router.put("/shop/{product_id}")
async def update_shop_product(product_id: str, data: ShopProductCreate, admin: dict = Depends(get_admin_user)):
    result = await db.shop_products.update_one({"id": product_id}, {"$set": data.model_dump()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Proizvod nije pronađen")
    product = await db.shop_products.find_one({"id": product_id}, {"_id": 0})
    return product

@api_router.delete("/shop/{product_id}")
async def delete_shop_product(product_id: str, admin: dict = Depends(get_admin_user)):
    result = await db.shop_products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Proizvod nije pronađen")
    return {"message": "Proizvod obrisan"}

# ============= SITE SETTINGS ROUTES =============

@api_router.get("/settings")
async def get_settings():
    settings = await db.settings.find_one({"id": "main"}, {"_id": 0})
    if not settings:
        default = SiteSettings()
        settings = {"id": "main", **default.model_dump()}
        await db.settings.insert_one(settings)
    return settings

@api_router.put("/settings")
async def update_settings(data: SiteSettings, admin: dict = Depends(get_admin_user)):
    await db.settings.update_one(
        {"id": "main"}, 
        {"$set": data.model_dump()}, 
        upsert=True
    )
    settings = await db.settings.find_one({"id": "main"}, {"_id": 0})
    return settings

# ============= PAYMENT ROUTES =============

PRICING_PLANS = {
    "monthly": {"name": "Mjesečna Pretplata", "price": 29.99, "interval": "month"},
    "yearly": {"name": "Godišnja Pretplata", "price": 249.99, "interval": "year"},
    "lifetime": {"name": "Doživotni Pristup", "price": 499.99, "interval": "once"}
}

@api_router.post("/payments/checkout")
async def create_checkout(data: PaymentCreate, request: Request, user: dict = Depends(get_current_user)):
    if data.plan_id not in PRICING_PLANS:
        raise HTTPException(status_code=400, detail="Nevažeći plan")
    
    plan = PRICING_PLANS[data.plan_id]
    host_url = str(request.base_url).rstrip('/')
    webhook_url = f"{host_url}/api/webhook/stripe"
    
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    success_url = f"{data.origin_url}/payment/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{data.origin_url}/courses"
    
    checkout_request = CheckoutSessionRequest(
        amount=plan['price'],
        currency="eur",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "user_id": user['id'],
            "plan_id": data.plan_id,
            "user_email": user['email']
        }
    )
    
    session = await stripe_checkout.create_checkout_session(checkout_request)
    
    # Create payment transaction record
    transaction = {
        "id": str(uuid.uuid4()),
        "session_id": session.session_id,
        "user_id": user['id'],
        "user_email": user['email'],
        "plan_id": data.plan_id,
        "amount": plan['price'],
        "currency": "eur",
        "payment_status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.payment_transactions.insert_one(transaction)
    
    return {"url": session.url, "session_id": session.session_id}

@api_router.post("/payments/course")
async def purchase_course(data: CoursePurchase, request: Request, user: dict = Depends(get_current_user)):
    # Check if course exists
    course = await db.courses.find_one({"id": data.course_id}, {"_id": 0})
    if not course:
        raise HTTPException(status_code=404, detail="Kurs nije pronađen")
    
    # Check if already purchased
    existing = await db.user_courses.find_one({"user_id": user['id'], "course_id": data.course_id})
    if existing:
        raise HTTPException(status_code=400, detail="Već ste kupili ovaj kurs")
    
    host_url = str(request.base_url).rstrip('/')
    webhook_url = f"{host_url}/api/webhook/stripe"
    
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    success_url = f"{data.origin_url}/payment/success?session_id={{CHECKOUT_SESSION_ID}}&type=course"
    cancel_url = f"{data.origin_url}/courses/{data.course_id}"
    
    checkout_request = CheckoutSessionRequest(
        amount=course['price'],
        currency="eur",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "user_id": user['id'],
            "course_id": data.course_id,
            "user_email": user['email'],
            "type": "course"
        }
    )
    
    session = await stripe_checkout.create_checkout_session(checkout_request)
    
    # Create transaction record
    transaction = {
        "id": str(uuid.uuid4()),
        "session_id": session.session_id,
        "user_id": user['id'],
        "user_email": user['email'],
        "course_id": data.course_id,
        "course_title": course['title'],
        "amount": course['price'],
        "currency": "eur",
        "payment_status": "pending",
        "type": "course",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.payment_transactions.insert_one(transaction)
    
    return {"url": session.url, "session_id": session.session_id}

@api_router.post("/checkout/shop-product")
async def purchase_shop_product(data: ShopProductPurchase, request: Request, user: dict = Depends(get_current_user)):
    """Create Stripe checkout session for shop product purchase"""
    # Check if product exists
    product = await db.shop_products.find_one({"id": data.product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Proizvod nije pronađen")
    
    if not product.get('in_stock', False):
        raise HTTPException(status_code=400, detail="Proizvod nije na stanju")
    
    host_url = str(request.base_url).rstrip('/')
    webhook_url = f"{host_url}/api/webhook/stripe"
    
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    success_url = f"{data.origin_url}/payment/success?session_id={{CHECKOUT_SESSION_ID}}&type=shop"
    cancel_url = f"{data.origin_url}/shop"
    
    checkout_request = CheckoutSessionRequest(
        amount=product['price'],
        currency="eur",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "user_id": user['id'],
            "product_id": data.product_id,
            "user_email": user['email'],
            "type": "shop_product",
            "product_title": product['title']
        }
    )
    
    session = await stripe_checkout.create_checkout_session(checkout_request)
    
    # Create transaction record
    transaction = {
        "id": str(uuid.uuid4()),
        "session_id": session.session_id,
        "user_id": user['id'],
        "user_email": user['email'],
        "product_id": data.product_id,
        "product_title": product['title'],
        "amount": product['price'],
        "currency": "eur",
        "payment_status": "pending",
        "type": "shop_product",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.payment_transactions.insert_one(transaction)
    
    return {"url": session.url, "session_id": session.session_id}

@api_router.get("/payments/status/{session_id}")
async def get_payment_status(session_id: str, request: Request):
    host_url = str(request.base_url).rstrip('/')
    webhook_url = f"{host_url}/api/webhook/stripe"
    
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    status = await stripe_checkout.get_checkout_status(session_id)
    
    # Update transaction and user if paid
    if status.payment_status == "paid":
        transaction = await db.payment_transactions.find_one({"session_id": session_id})
        if transaction and transaction.get('payment_status') != 'paid':
            await db.payment_transactions.update_one(
                {"session_id": session_id},
                {"$set": {"payment_status": "paid", "paid_at": datetime.now(timezone.utc).isoformat()}}
            )
            
            # Check if this is a course purchase
            if transaction.get('type') == 'course' and transaction.get('course_id'):
                # Add course to user's purchased courses
                await db.user_courses.update_one(
                    {"user_id": transaction['user_id'], "course_id": transaction['course_id']},
                    {"$set": {
                        "user_id": transaction['user_id'],
                        "course_id": transaction['course_id'],
                        "purchased_at": datetime.now(timezone.utc).isoformat()
                    }},
                    upsert=True
                )
            else:
                # Subscription purchase - activate subscription
                await db.users.update_one(
                    {"id": transaction['user_id']},
                    {"$set": {"subscription_status": "active"}}
                )
    
    return {
        "status": status.status,
        "payment_status": status.payment_status,
        "amount_total": status.amount_total,
        "currency": status.currency
    }

@api_router.get("/user/courses")
async def get_user_courses(user: dict = Depends(get_current_user)):
    """Get courses purchased by the current user"""
    # Get all purchased course IDs
    user_courses = await db.user_courses.find({"user_id": user['id']}, {"_id": 0}).to_list(100)
    course_ids = [uc['course_id'] for uc in user_courses]
    
    # Get course details
    courses = []
    for course_id in course_ids:
        course = await db.courses.find_one({"id": course_id}, {"_id": 0})
        if course:
            courses.append(course)
    
    return courses

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    body = await request.body()
    signature = request.headers.get("Stripe-Signature")
    
    host_url = str(request.base_url).rstrip('/')
    webhook_url = f"{host_url}/api/webhook/stripe"
    
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    try:
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        
        if webhook_response.payment_status == "paid":
            user_id = webhook_response.metadata.get("user_id")
            if user_id:
                await db.payment_transactions.update_one(
                    {"session_id": webhook_response.session_id},
                    {"$set": {"payment_status": "paid", "paid_at": datetime.now(timezone.utc).isoformat()}}
                )
                await db.users.update_one(
                    {"id": user_id},
                    {"$set": {"subscription_status": "active"}}
                )
        
        return {"status": "ok"}
    except Exception as e:
        logging.error(f"Webhook error: {e}")
        return {"status": "error", "message": str(e)}

# ============= ADMIN ROUTES =============

@api_router.get("/admin/stats")
async def get_admin_stats(admin: dict = Depends(get_admin_user)):
    total_users = await db.users.count_documents({})
    active_subs = await db.users.count_documents({"subscription_status": "active"})
    total_courses = await db.courses.count_documents({})
    total_payments = await db.payment_transactions.count_documents({"payment_status": "paid"})
    
    recent_users = await db.users.find({}, {"_id": 0, "password": 0}).sort("created_at", -1).limit(10).to_list(10)
    recent_payments = await db.payment_transactions.find({"payment_status": "paid"}, {"_id": 0}).sort("paid_at", -1).limit(10).to_list(10)
    
    return {
        "total_users": total_users,
        "active_subscriptions": active_subs,
        "total_courses": total_courses,
        "total_payments": total_payments,
        "recent_users": recent_users,
        "recent_payments": recent_payments
    }

@api_router.get("/admin/users")
async def get_all_users(admin: dict = Depends(get_admin_user)):
    users = await db.users.find({}, {"_id": 0, "password": 0}).to_list(1000)
    return users

@api_router.put("/admin/users/{user_id}/subscription")
async def update_user_subscription(user_id: str, status: str, admin: dict = Depends(get_admin_user)):
    if status not in ["active", "inactive"]:
        raise HTTPException(status_code=400, detail="Nevažeći status")
    
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": {"subscription_status": status}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Korisnik nije pronađen")
    
    return {"message": f"Status pretplate ažuriran na {status}"}

@api_router.delete("/admin/users/{user_id}")
async def delete_user(user_id: str, admin: dict = Depends(get_admin_user)):
    result = await db.users.delete_one({"id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Korisnik nije pronađen")
    return {"message": "Korisnik obrisan"}

# ============= CONTACT ROUTES =============

@api_router.post("/contact")
async def submit_contact(data: ContactMessage):
    message = {
        "id": str(uuid.uuid4()),
        **data.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "read": False
    }
    await db.contact_messages.insert_one(message)
    return {"message": "Poruka uspješno poslata"}

@api_router.get("/admin/messages")
async def get_messages(admin: dict = Depends(get_admin_user)):
    messages = await db.contact_messages.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return messages

# ============= ROOT =============

@api_router.get("/")
async def root():
    return {"message": "Continental Academy API"}

# ============= SETUP =============

async def create_admin_user():
    admin = await db.users.find_one({"email": "admin@serbiana.com"})
    if not admin:
        admin_user = {
            "id": str(uuid.uuid4()),
            "email": "admin@serbiana.com",
            "password": hash_password("admin123"),
            "name": "Administrator",
            "role": "admin",
            "subscription_status": "active",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(admin_user)
        logging.info("Admin user created: admin@serbiana.com / admin123")

async def seed_initial_data():
    # Check if data exists
    courses_count = await db.courses.count_documents({})
    if courses_count == 0:
        # Seed courses - TikTok, YouTube, Facebook
        courses = [
            {
                "id": str(uuid.uuid4()),
                "title": "TikTok Monetizacija",
                "description": "Naučite kako monetizovati TikTok profil i zarađivati od kratkih videa. Kompletan vodič od 0 do prvog novca.",
                "thumbnail": "https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=800",
                "mux_video_id": "placeholder",
                "price": 29.99,
                "is_free": False,
                "order": 1,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "title": "YouTube Masterclass",
                "description": "Kompletna strategija za uspjeh na YouTube-u. Od kreiranja kanala do monetizacije i sponzorstva.",
                "thumbnail": "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800",
                "mux_video_id": "placeholder",
                "price": 29.99,
                "is_free": False,
                "order": 2,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Facebook & Instagram Ads",
                "description": "Ovladajte Facebook i Instagram oglašavanjem. Naučite kako targetirati publiku i maksimizirati ROI.",
                "thumbnail": "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=800",
                "mux_video_id": "placeholder",
                "price": 29.99,
                "is_free": False,
                "order": 3,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        ]
        await db.courses.insert_many(courses)
    
    # Seed Shop Products
    shop_count = await db.shop_products.count_documents({})
    if shop_count == 0:
        shop_products = [
            {
                "id": str(uuid.uuid4()),
                "title": "YouTube Monetizovan Kanal",
                "description": "Potpuno monetizovan YouTube kanal spreman za zaradu. 1000+ subscribera, 4000+ sati watch time.",
                "thumbnail": "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800",
                "platform": "youtube",
                "price": 299.99,
                "features": ["1000+ Subscribera", "4000+ Watch Hours", "Monetizacija Aktivna", "Čist Copyright", "Transfer Vlasništva"],
                "in_stock": True,
                "order": 1,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "title": "TikTok Monetizovan Account",
                "description": "TikTok account sa aktiviranom monetizacijom. Spreman za Creator Fund i LIVE poklone.",
                "thumbnail": "https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=800",
                "platform": "tiktok",
                "price": 199.99,
                "features": ["10K+ Followera", "Creator Fund Aktivan", "LIVE Gifts Enabled", "Čist Account", "Instant Transfer"],
                "in_stock": True,
                "order": 2,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Facebook Monetizovan Page",
                "description": "Facebook stranica sa aktivnom monetizacijom. In-Stream Ads i Reels bonus program.",
                "thumbnail": "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=800",
                "platform": "facebook",
                "price": 249.99,
                "features": ["10K+ Followera", "In-Stream Ads Aktivan", "Reels Bonus", "Professional Mode", "Brand Collabs"],
                "in_stock": True,
                "order": 3,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        ]
        await db.shop_products.insert_many(shop_products)
    
    # Seed FAQs
    faqs_count = await db.faqs.count_documents({})
    if faqs_count == 0:
        faqs = [
            {"id": str(uuid.uuid4()), "question": "Kako mogu pristupiti kursevima?", "answer": "Nakon kupovine pretplate, svi kursevi su vam dostupni u Dashboard sekciji.", "order": 1},
            {"id": str(uuid.uuid4()), "question": "Da li mogu otkazati pretplatu?", "answer": "Otkazivanje pretplate vrši se putem kontaktiranja našeg support tima.", "order": 2},
            {"id": str(uuid.uuid4()), "question": "Koliko dugo imam pristup?", "answer": "Zavisno od izabranog plana - mjesečno, godišnje ili doživotno.", "order": 3},
            {"id": str(uuid.uuid4()), "question": "Da li nudite povrat novca?", "answer": "Da, nudimo 30-dnevnu garanciju povrata novca.", "order": 4}
        ]
        await db.faqs.insert_many(faqs)
    
    # Seed Results
    results_count = await db.results.count_documents({})
    if results_count == 0:
        results = [
            {"id": str(uuid.uuid4()), "image": "https://images.unsplash.com/photo-1492337034744-218795d77f43?w=800", "text": "Marko - Zaradio 5000€ u prvom mjesecu", "order": 1},
            {"id": str(uuid.uuid4()), "image": "https://images.unsplash.com/photo-1630941697803-5eec7b685a72?w=800", "text": "Ana - Napustila posao i sada radi od kuće", "order": 2}
        ]
        await db.results.insert_many(results)
    
    # Seed Settings
    settings = await db.settings.find_one({"id": "main"})
    if not settings:
        default_settings = {
            "id": "main",
            "hero_title": "Zaradi Sa Nama",
            "hero_subtitle": "Nauči vještine koje će promijeniti tvoj život i finansijsku budućnost",
            "hero_image": "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1920",
            "intro_video_mux_id": "",
            "why_us_title": "Zašto Baš Continental Academy?",
            "why_us_points": [
                "Provjerene metode zarade",
                "Podrška 24/7",
                "Zajednica od 1500+ članova",
                "Praktični kursevi sa primjerima"
            ],
            "stats_members": 1500,
            "stats_projects": 350,
            "stats_courses": 12,
            "discord_link": "https://discord.gg/continentall",
            "support_text": "Support nam je 24/7",
            "footer_text": "© 2024 Continental Academy. Sva prava zadržana.",
            "nav_links": [
                {"label": "Početna", "href": "/"},
                {"label": "Kursevi", "href": "/courses"},
                {"label": "Shop", "href": "/shop"},
                {"label": "Cjenovnik", "href": "/pricing"},
                {"label": "O nama", "href": "/about"},
                {"label": "Kontakt", "href": "/contact"}
            ],
            "pricing_plans": [
                {"id": "monthly", "name": "Mjesečna", "price": 29.99, "features": ["Pristup svim kursevima", "Discord zajednica", "Mjesečni webinari"]},
                {"id": "yearly", "name": "Godišnja", "price": 249.99, "features": ["Sve iz mjesečne", "2 mjeseca gratis", "1-na-1 konzultacije"]},
                {"id": "lifetime", "name": "Doživotna", "price": 499.99, "features": ["Sve iz godišnje", "Doživotni pristup", "VIP podrška"]}
            ]
        }
        await db.settings.insert_one(default_settings)

@app.on_event("startup")
async def startup():
    await create_admin_user()
    await seed_initial_data()

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
