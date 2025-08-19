# backend/app.py
import os, json, mimetypes
from datetime import datetime, timedelta
from fastapi import FastAPI, Request, HTTPException, Response, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sorting import resort_all_data, reverse_subset, convert_video_labels, sort_video_labels_by_date
from pathlib import Path
import platform
from dotenv import load_dotenv
from jose import JWTError, jwt
from passlib.context import CryptContext
from typing import Optional

load_dotenv()

DEFAULT_JSON_BASENAME = "GameCamClassifiers.json"
APP_PORT = 10000

# Security configuration
SECRET_KEY = "pecoscams-family-secret-key-2024"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 120  # 2 hours

# Hardcoded credentials
USERNAME = "family"
PASSWORD = "pecoscams"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

system = platform.system().lower()
default_restricted = True
data = {}

# Hash the password on startup
PASSWORD_HASH = pwd_context.hash(PASSWORD)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        if username != USERNAME:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    return username

def get_json_path():
    env = os.getenv('JSON_DIR')
    if env:
        p = env.replace("~", str(Path.home()))
    else:
        if system == "windows":
            p = r"C:\Users\jrsch\Documents\Visual Studio Code\Deer Score Prediction\yolov5\GameCamFiles\GameCamClassifierJSONs"
        elif system == "linux":
            p = "/mnt/D"

    path = os.path.join(p, DEFAULT_JSON_BASENAME)
    return path, p

def load_data_into_memory():
    """Reads and processes the JSON data, storing it in the global data_store. Also converts paths as needed"""
    print("Loading and sorting label data from disk...")
    global data
    path, root = get_json_path()
    print(f"Using JSON path: {path}")
    with open(path, 'r') as f:
        init_data = json.load(f)

    if system == 'linux':
        converted_data = convert_video_labels(init_data, root)
    else:
        converted_data = init_data

    data = sort_video_labels_by_date(converted_data)
    print("Data loading complete.")

# --- FastAPI event handler to run on startup ---
app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.on_event("startup")
def startup_event():
    """Event handler to load data into memory when the app starts."""
    load_data_into_memory()

@app.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    if form_data.username != USERNAME or not verify_password(form_data.password, PASSWORD_HASH):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": form_data.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/labels")
def get_labels(request: Request, current_user: str = Depends(get_current_user)):
    qp = request.query_params

    # If no filters are provided, this is the initial load, return all entries
    if len(qp) == 0:
        print("No filters provided, returning all entries.")
        return {
            "sites": {v['site']: v['gps'] for v in data['sites'].values()},
            "animals": ['none'] + [item for item in data['sorted_videos']['animal_videos'].keys() if item != 'none'],
            "actions": ['none'] + list(data['sorted_videos']['actions'].keys()),
            "add_labels": ['none'] + list(data['sorted_videos']['additional_labels'].keys()),
            "video_labels": data['video_labels'],
            # default to 1/1/2020
            "start": datetime(2020, 1, 1).date(),
            "end": datetime.now().date(),
            "restricted": default_restricted,
        }
    
    # Get filter parameters - empty lists mean no selection for that category
    sites = qp.get("sites")
    animals = qp.get("animals").split(",")
    actions = qp.get("actions").split(",")
    add_labels = qp.get("add_labels").split(",")
    start = qp.get("start")
    end = qp.get("end")
    restricted = qp.get("restricted")
    
    videos = resort_all_data(data, sites, animals, actions, add_labels, [start, end], restricted)
    subset_labels = {v: data['video_labels'][v] for v in videos}

    rsub = reverse_subset(videos, data['video_labels'])
    print(f"Returning {len(subset_labels)} video labels after filtering.")
    return {
        "video_labels": subset_labels,
        "reverse_subset": rsub,
    }

@app.get("/api/video")
def get_video(request: Request, path: str, token: Optional[str] = None):
    # Handle token from query params for video streaming
    if token:
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            username = payload.get("sub")
            if username != USERNAME:
                print("Invalid token: username mismatch")
                raise HTTPException(status_code=401, detail="Invalid token")
        except JWTError:
            print("Invalid token: JWTError")
            raise HTTPException(status_code=401, detail="Invalid token")
    else:
        print("No token provided in request")
        raise HTTPException(status_code=401, detail="Missing token")
    if path not in data['video_labels']:
        print(f"Video path '{path}' not indexed in data.")
        raise HTTPException(status_code=404, detail="Video not indexed")
    if not os.path.exists(path):
        print(f"Video file '{path}' does not exist.")
        raise HTTPException(status_code=404, detail="File not found")
    file_size = os.path.getsize(path)
    range_header = request.headers.get("range")
    start = 0
    end = file_size - 1
    if range_header and range_header.startswith("bytes="):
        s = range_header.split("=")[1]
        s = s.split("-")
        if s[0]: start = int(s[0])
        if len(s) > 1 and s[1]: end = int(s[1])
    if start > end or start < 0 or end >= file_size:
        raise HTTPException(status_code=416, detail="Range Not Satisfiable")
    def iterfile(fp, start, end, chunk=1024*1024):
        with open(fp, "rb") as f:
            f.seek(start)
            remaining = end - start + 1
            while remaining > 0:
                data = f.read(min(chunk, remaining))
                if not data: break
                remaining -= len(data)
                yield data
    media_type = mimetypes.guess_type(path)[0] or "application/octet-stream"
    headers = {
        "Content-Range": f"bytes {start}-{end}/{file_size}",
        "Accept-Ranges": "bytes",
        "Content-Length": str(end - start + 1),
    }
    return StreamingResponse(iterfile(path, start, end), status_code=206, media_type=media_type, headers=headers)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main_server:app", host="0.0.0.0", port=APP_PORT, reload=True)
