from flask import Blueprint, g, jsonify, request

from auth import require_auth
from data.tasks import (
    create_task as insert_task,
    delete_task as delete_task_row,
    get_task_for_user,
    list_tasks_for_user,
    update_task_status,
)
from data.users import get_user
from services.email import send_email
from utils import clean_string


tasks_bp = Blueprint("tasks", __name__)

VALID_TASK_STATUSES = {"pending", "in_progress", "completed"}


@tasks_bp.get("/tasks")
@require_auth
def list_tasks():
    return jsonify({"tasks": list_tasks_for_user(g.current_user["id"])})


@tasks_bp.post("/tasks")
@require_auth
def create_task():
    payload = request.get_json(silent=True) or {}
    title = clean_string(payload.get("title"))
    description = clean_string(payload.get("description"))
    assigned_to = clean_string(payload.get("assigned_to"))

    if not title:
        return jsonify({"error": "title is required"}), 400

    if not assigned_to:
        return jsonify({"error": "assigned_to is required"}), 400

    assignee = get_user(assigned_to)
    if not assignee:
        return jsonify({"error": "assignee not found"}), 404

    task = insert_task(
        {
            "title": title,
            "description": description,
            "created_by": g.current_user["id"],
            "assigned_to": assigned_to,
        }
    )

    response = {"task": task}
    email_warning = send_assignment_email(assignee["email"], title)
    if email_warning:
        response["email_warning"] = email_warning

    return jsonify(response), 201


@tasks_bp.patch("/tasks/<task_id>")
@require_auth
def update_task(task_id):
    payload = request.get_json(silent=True) or {}
    status = clean_string(payload.get("status"))

    if status not in VALID_TASK_STATUSES:
        return jsonify({"error": "status must be pending, in_progress, or completed"}), 400

    task = get_task_for_user(task_id, g.current_user["id"])
    if not task:
        return jsonify({"error": "task not found"}), 404

    if task["status"] == "completed":
        if status != "completed":
            return jsonify({"error": "completed tasks cannot be updated"}), 409
        return jsonify({"task": task})

    if status == task["status"]:
        return jsonify({"task": task})

    updated = update_task_status(task_id, status)
    updated_task = get_task_for_user(updated["id"], g.current_user["id"])

    response = {"task": updated_task}
    email_warning = send_completion_email_if_needed(task, status)
    if email_warning:
        response["email_warning"] = email_warning

    return jsonify(response)


@tasks_bp.delete("/tasks/<task_id>")
@require_auth
def delete_task(task_id):
    task = get_task_for_user(task_id, g.current_user["id"])
    if not task:
        return jsonify({"error": "task not found"}), 404

    if task["created_by"] != g.current_user["id"]:
        return jsonify({"error": "only the creator can delete this task"}), 403

    delete_task_row(task_id)
    return "", 204


def send_assignment_email(assignee_email: str, title: str) -> str | None:
    try:
        send_email(
            assignee_email,
            "A new task has been assigned to you",
            f"A new task has been assigned to you: {title}",
        )
    except Exception as exc:
        return str(exc)

    return None


def send_completion_email_if_needed(task: dict, status: str) -> str | None:
    if task["status"] == "completed" or status != "completed":
        return None

    creator = get_user(task["created_by"])
    if not creator:
        return None

    try:
        send_email(
            creator["email"],
            "Your task has been completed",
            f"Your task {task['title']} has been marked as completed",
        )
    except Exception as exc:
        return str(exc)

    return None
