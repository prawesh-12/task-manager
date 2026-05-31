from supabase_client import supabase


TASK_SELECT_FIELDS = (
    "*,"
    "creator:users!tasks_created_by_fkey(id,email,name),"
    "assignee:users!tasks_assigned_to_fkey(id,email,name)"
)


def list_tasks_for_user(user_id: str) -> list[dict]:
    response = (
        supabase.table("tasks")
        .select(TASK_SELECT_FIELDS)
        .or_(f"created_by.eq.{user_id},assigned_to.eq.{user_id}")
        .order("created_at", desc=True)
        .execute()
    )
    return response.data


def get_task_for_user(task_id: str, user_id: str) -> dict | None:
    response = (
        supabase.table("tasks")
        .select(TASK_SELECT_FIELDS)
        .eq("id", task_id)
        .or_(f"created_by.eq.{user_id},assigned_to.eq.{user_id}")
        .execute()
    )
    return response.data[0] if response.data else None


def create_task(task: dict) -> dict:
    created = supabase.table("tasks").insert(task).execute().data[0]
    return get_task_for_user(created["id"], created["created_by"])


def update_task_status(task_id: str, status: str) -> dict:
    return (
        supabase.table("tasks")
        .update({"status": status})
        .eq("id", task_id)
        .execute()
        .data[0]
    )


def delete_task(task_id: str) -> None:
    supabase.table("tasks").delete().eq("id", task_id).execute()
