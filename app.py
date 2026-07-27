import os
from fastapi import FastAPI, Form, HTTPException, Request
from fastapi.responses import RedirectResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from supabase import create_client, Client
from pydantic import BaseModel
from fastapi.responses import RedirectResponse
from pydantic import BaseModel

class HabitCreate(BaseModel):
    title: str
    extra_info: str = ""
    frequency: str

class NoteCreate(BaseModel):
    title: str
    content: str

class FinanceCreate(BaseModel):
    amount: float
    reason: str

# Add these two lines right here:
from dotenv import load_dotenv
load_dotenv()  # This reads your .env file and loads it into os.environ

# Now os.environ.get will actually see your keys!
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

templates = Jinja2Templates(directory="templates")


class TaskCreate(BaseModel):
    content: str


def current_username(request: Request) -> str:
    username = request.cookies.get("lifeos_user")
    if not username:
        raise HTTPException(status_code=401, detail="Please sign in first")
    return username


@app.get("/")
async def root():
    response = supabase.table('users').select("*").execute()
    print(response)
    return RedirectResponse(url="/index")


@app.get("/index")
async def index(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="login.html",
        context={
            "request": request,
            "username": request.cookies.get("lifeos_user", "")
        }
    )

@app.get("/register")
async def index(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="register.html",
        context={
            "request": request
        }
    )

@app.get("/home")
async def home(request: Request):

    current_username(request)

    return templates.TemplateResponse(
        request=request,
        name="home.html",
        context={"request": request},
    )

@app.post("/backendsignup")
# 2. Accept name and password as Form fields
async def backendsignup(username: str = Form(...), password: str = Form(...)):
    
    # 3. Insert the data into Supabase
    response = (
        supabase.table("users")
        .insert({"username": username, "password": password})
        .execute()
    )
    print(response)
    
    # 4. Redirect the user somewhere after success (e.g., back to home or login)
    return RedirectResponse(url="/index", status_code=303)

    
from fastapi import Form
from fastapi.responses import RedirectResponse

@app.post("/backendlogin")
async def backendlogin(
    username: str = Form(...),
    password: str = Form(...)
):

    response = (
        supabase
        .table("users")
        .select("*")
        .eq("username", username)
        .maybe_single()
        .execute()
    )

    user = response.data

    # User doesn't exist
    if user is None:
        print(f"Login failed: '{username}' not found")
        return RedirectResponse(url="/index", status_code=303)

    # Password incorrect
    if user["password"] != password:
        print(f"Login failed: Incorrect password for '{username}'")
        return RedirectResponse(url="/index", status_code=303)

    print(f"Login successful: {username}")

    redirect = RedirectResponse(url="/home", status_code=303)
    redirect.set_cookie("lifeos_user", username, httponly=True, samesite="lax")
    return redirect


@app.get("/api/notes")
async def list_notes(request: Request):

    username = current_username(request)

    response = (
        supabase
        .table("notes")
        .select("*")
        .eq("created_by", username)
        .execute()
    )

    return {"notes": response.data or []}


@app.post("/api/notes")
async def create_note(
    payload: NoteCreate,
    request: Request
):

    username = current_username(request)

    response = (
        supabase
        .table("notes")
        .insert({
            "created_by": username,
            "title": payload.title,
            "content": payload.content
        })
        .execute()
    )

    return {"note": response.data[0]}


@app.put("/api/notes/{note_id}")
async def update_note(
    note_id: str,
    payload: NoteCreate,
    request: Request,
):
    username = current_username(request)
    response = (
        supabase
        .table("notes")
        .update({"title": payload.title, "content": payload.content})
        .eq("id", note_id)
        .eq("created_by", username)
        .execute()
    )
    if not response.data:
        raise HTTPException(404, "Note not found")
    return {"note": response.data[0]}


@app.delete("/api/notes/{note_id}")
async def delete_note(
    note_id: str,
    request: Request
):

    username = current_username(request)

    response = (
        supabase
        .table("notes")
        .delete()
        .eq("id", note_id)
        .eq("created_by", username)
        .execute()
    )

    if not response.data:
        raise HTTPException(404, "Note not found")

    return {"deleted": note_id}

@app.get("/api/finance")
async def list_finance(request: Request):

    username = current_username(request)

    response = (
        supabase
        .table("finance")
        .select("*")
        .eq("created_by", username)
        .execute()
    )

    return {"finance": response.data or []}


@app.post("/api/finance")
async def create_finance(
    payload: FinanceCreate,
    request: Request
):
    username = current_username(request)
    response = (
        supabase
        .table("finance")
        .insert({
            "created_by": username,
            "amount": payload.amount,
            "reason": payload.reason
        })
        .execute()
    )

    return {"finance": response.data[0]}


@app.post("/uploadfinance")
async def upload_finance(
    request: Request,
    amount: float = Form(...),
    reason: str = Form(...),
):
    """Store a finance entry submitted by the Finance window form."""
    username = current_username(request)
    response = (
        supabase
        .table("finance")
        .insert({
            "created_by": username,
            "amount": amount,
            "reason": reason.strip(),
        })
        .execute()
    )
    return {"finance": response.data[0]}


@app.delete("/api/finance/{item_id}")
async def delete_finance(
    item_id: str,
    request: Request
):

    username = current_username(request)

    response = (
        supabase
        .table("finance")
        .delete()
        .eq("id", item_id)
        .eq("created_by", username)
        .execute()
    )

    if not response.data:
        raise HTTPException(404, "Record not found")

    return {"deleted": item_id}

@app.get("/api/habits")
async def list_habits(request: Request):

    username = current_username(request)

    response = (
        supabase
        .table("habits")
        .select("*")
        .eq("created_by", username)
        .execute()
    )

    return {"habits": response.data or []}


@app.post("/api/habits")
async def create_habit(
    payload: HabitCreate,
    request: Request
):

    username = current_username(request)

    response = (
        supabase
        .table("habits")
        .insert({
            "created_by": username,
            "content": payload.title,
            "extra_info": payload.extra_info,
            "frequency": payload.frequency
        })
        .execute()
    )

    return {"habit": response.data[0]}


@app.delete("/api/habits/{habit_id}")
async def delete_habit(
    habit_id: str,
    request: Request
):

    username = current_username(request)

    response = (
        supabase
        .table("habits")
        .delete()
        .eq("id", habit_id)
        .eq("created_by", username)
        .execute()
    )

    if not response.data:
        raise HTTPException(404, "Habit not found")

    return {"deleted": habit_id}

@app.post("/updatetaskdone")
async def update_task_done(
    request: Request,
    task_id: str = Form(...),
):
    """Mark one of the current user's tasks as complete."""
    username = current_username(request)
    response = (
        supabase.table("tasks")
        .update({"done": True})
        .eq("id", task_id)
        .eq("created_by", username)
        .eq("done", False)
        .execute()
    )

    if not response.data:
        raise HTTPException(status_code=404, detail="Incomplete task not found")

    return {"task": response.data[0]}


@app.get("/api/tasks")
async def list_tasks(request: Request):
    """Return tasks for the signed-in user, ready for a window renderer."""
    username = current_username(request)
    response = (
        supabase.table("tasks")
        .select("id, content, done")
        .eq("created_by", username)
        .execute()
    )
    return {"tasks": response.data or []}


@app.post("/api/tasks")
async def create_task(payload: TaskCreate, request: Request):
    username = current_username(request)
    content = payload.content.strip()
    if not content:
        raise HTTPException(status_code=422, detail="Task content is required")
    response = (
        supabase.table("tasks")
        .insert({"created_by": username, "content": content, "done": False})
        .execute()
    )
    return {"task": response.data[0]}


@app.delete("/api/tasks/{task_id}")
async def delete_task(task_id: str, request: Request):
    username = current_username(request)
    response = (
        supabase.table("tasks")
        .delete()
        .eq("id", task_id)
        .eq("created_by", username)
        .execute()
    )
    if not response.data:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"deleted": task_id}

