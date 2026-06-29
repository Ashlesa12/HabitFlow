from fastapi import FastAPI
from pydantic import BaseModel
from pymongo import MongoClient
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta , date
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer
from jose import jwt, JWTError
from fastapi.middleware.cors import CORSMiddleware
from bson import ObjectId
import os
from dotenv import load_dotenv

load_dotenv()

print(os.getenv("MONGODB_URI"))
print(os.getenv("JWT_SECRET"))

# ==================================
# APP
# ==================================

app = FastAPI()

# solving CORS issue
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================================
# DATABASE
# ==================================


client = MongoClient(os.getenv("MONGODB_URI"))

db = client["habitflow_db"]

users_collection = db["users"]


SECRET_KEY = os.getenv("JWT_SECRET")
ALGORITHM = "HS256"
TOKEN_EXPIRE_HOURS = 24

# ==================================
# PASSWORD HASHING
# ==================================

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

def hash_password(password: str):
    return pwd_context.hash(password)

#security handler
security = HTTPBearer()

# ==================================
# MODELS
# ==================================

class User(BaseModel):
    email: str
    password: str

class HabitDate(BaseModel):
    date: str

#token verification
def get_current_user(token=Depends(security)):
    try:
        decoded = jwt.decode(
            token.credentials,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        return decoded

    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

# password verification 
def verify_password(
    plain_password: str,
    hashed_password: str
):
    return pwd_context.verify(
        plain_password,
        hashed_password
    )


# function to create JWT token
def create_token(data: dict):

    payload = data.copy()

    expire = datetime.utcnow() + timedelta(
        hours=TOKEN_EXPIRE_HOURS
    )

    payload.update({
        "exp": expire
    })

    token = jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return token

# ==================================
# ROUTES
# ==================================

@app.get("/")
def home():
    return {
        "message": "HabitFlow API running 🚀"
    }

# REGISTER

@app.post("/register")
def register(user: User):

    # Check if email already exists
    existing_user = users_collection.find_one(
        {"email": user.email}
    )

    if existing_user:
        return {
            "error": "User already exists"
        }

    # Hash password
    hashed_password = hash_password(
        user.password
    )

    # Save user
    users_collection.insert_one({
        "email": user.email,
        "password": hashed_password
    })

    return {
        "message": "User registered successfully"
    }

# GET ALL USERS (testing only)

@app.get("/users")
def get_users():

    users = users_collection.find()

    result = []

    for user in users:
        result.append({
            "id": str(user["_id"]),
            "email": user["email"]
        })

    return result

@app.delete("/clear-users")
def clear_users():

    users_collection.delete_many({})

    return {
        "message": "All users deleted"
    }


# login route
@app.post("/login")
def login(user: User):

    db_user = users_collection.find_one(
        {"email": user.email}
    )

    if not db_user:
        return {
            "error": "User not found"
        }

    if not verify_password(
        user.password,
        db_user["password"]
    ):
        return {
            "error": "Invalid password"
        }

    token = create_token({
    "email": db_user["email"],
    "user_id": str(db_user["_id"])
})

    return {
    "access_token": token
}

@app.get("/me")
def get_me(user=Depends(get_current_user)):
    return {
        "message": "User data fetched successfully",
        "user": user
    }


# ==================================
# HABITS
# ==================================

class Habit(BaseModel):
    title: str

habits_collection = db["habits"]

@app.post("/habits")
def create_habit(habit: Habit, user=Depends(get_current_user)):

    new_habit = {
    "user_id": user["user_id"],
    "title": habit.title,
    "created_at": datetime.utcnow(),
    "completed_dates": [],
    "rest_dates": []
}

    habits_collection.insert_one(new_habit)

    return {"message": "Habit created"}

@app.get("/habits")
def get_habits(user=Depends(get_current_user)):

    habits = habits_collection.find({"user_id": user["user_id"]})

    result = []

    for h in habits:
        result.append({
            "id": str(h["_id"]),
            "title": h["title"],
            "completed_dates": h["completed_dates"],
            "rest_dates": h.get("rest_dates", [])
        })

    return result


@app.post("/habits/{habit_id}/toggle")
def toggle_habit(
    habit_id: str,
    data: HabitDate,
    user=Depends(get_current_user)
):
    habit = habits_collection.find_one({
        "_id": ObjectId(habit_id),
        "user_id": user["user_id"]
    })

    if not habit:
        return {"error": "Habit not found"}

    selected_date = data.date

    if selected_date in habit["completed_dates"]:

        habits_collection.update_one(
            {"_id": ObjectId(habit_id)},
            {
                "$pull": {
                    "completed_dates": selected_date
                }
            }
        )

        return {"message": "Habit unchecked"}

    habits_collection.update_one(
        {"_id": ObjectId(habit_id)},
        {
            "$pull": {
                "rest_dates": selected_date
            }
        }
    )

    habits_collection.update_one(
        {"_id": ObjectId(habit_id)},
        {
            "$push": {
                "completed_dates": selected_date
            }
        }
    )

    return {"message": "Habit completed"}

@app.delete("/habits/{habit_id}")
def delete_habit(
    habit_id: str,
    user=Depends(get_current_user)
):
    result = habits_collection.delete_one({
        "_id": ObjectId(habit_id),
        "user_id": user["user_id"]
    })

    if result.deleted_count == 0:
        return {
            "error": "Habit not found"
        }

    return {
        "message": "Habit deleted"
    }

# rest days

@app.post("/habits/{habit_id}/rest")
def toggle_rest_day(
    habit_id: str,
    data: HabitDate,
    user=Depends(get_current_user)
):
    habit = habits_collection.find_one({
        "_id": ObjectId(habit_id),
        "user_id": user["user_id"]
    })

    if not habit:
        return {"error": "Habit not found"}

    selected_date = data.date

    completed_dates = habit.get("completed_dates", [])
    rest_dates = habit.get("rest_dates", [])

    # Already a rest day -> remove it
    if selected_date in rest_dates:

        habits_collection.update_one(
            {"_id": ObjectId(habit_id)},
            {
                "$pull": {
                    "rest_dates": selected_date
                }
            }
        )

        return {"message": "Rest day removed"}

    # If completed, remove completion first
    if selected_date in completed_dates:

        habits_collection.update_one(
            {"_id": ObjectId(habit_id)},
            {
                "$pull": {
                    "completed_dates": selected_date
                }
            }
        )

    # Add as rest day
    habits_collection.update_one(
        {"_id": ObjectId(habit_id)},
        {
            "$push": {
                "rest_dates": selected_date
            }
        }
    )

    return {"message": "Rest day added"}

