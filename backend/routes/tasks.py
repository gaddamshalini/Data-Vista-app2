from datetime import datetime, date
from flask import Blueprint, request, jsonify
from database import SessionLocal
from models import StudentTask, Student

tasks_bp = Blueprint("tasks", __name__, url_prefix="/api/tasks")

@tasks_bp.route("/<student_id>", methods=["GET"])
def get_student_tasks(student_id):
    """
    Returns tasks for a student with filtering and summary completion statistics.
    Filter options:
      - filter: 'all', 'today', 'weekly', 'completed', 'pending', 'overdue'
      - category: filter by task category
    """
    db = SessionLocal()
    try:
        query = db.query(StudentTask).filter(StudentTask.student_id == student_id)
        
        # Category filter
        category = request.args.get("category")
        if category and category != "All":
            query = query.filter(StudentTask.category == category)

        all_student_tasks = db.query(StudentTask).filter(StudentTask.student_id == student_id).all()
        
        # Compute real statistics across all student tasks
        today_str = date.today().isoformat()
        total_tasks = len(all_student_tasks)
        completed_tasks = sum(1 for t in all_student_tasks if t.status == "Completed")
        pending_tasks = total_tasks - completed_tasks
        overdue_tasks = sum(1 for t in all_student_tasks if t.is_overdue())
        
        today_list = [t for t in all_student_tasks if t.deadline == today_str]
        today_tasks_count = len(today_list)
        today_completed_count = sum(1 for t in today_list if t.status == "Completed")
        
        weekly_list = [t for t in all_student_tasks if t.is_weekly_goal or t.category == "Weekly Goal"]
        weekly_goals_count = len(weekly_list)
        weekly_completed_count = sum(1 for t in weekly_list if t.status == "Completed")

        overall_completion_pct = round((completed_tasks / total_tasks * 100), 1) if total_tasks > 0 else 0.0
        daily_completion_pct = round((today_completed_count / today_tasks_count * 100), 1) if today_tasks_count > 0 else 0.0
        weekly_completion_pct = round((weekly_completed_count / weekly_goals_count * 100), 1) if weekly_goals_count > 0 else 0.0

        # Apply specific view filters
        view_filter = request.args.get("filter", "all").lower()
        if view_filter == "today":
            tasks = [t for t in query.all() if t.deadline == today_str]
        elif view_filter == "weekly":
            tasks = query.filter((StudentTask.is_weekly_goal == True) | (StudentTask.category == "Weekly Goal")).all()
        elif view_filter == "completed":
            tasks = query.filter(StudentTask.status == "Completed").all()
        elif view_filter == "pending":
            tasks = query.filter(StudentTask.status != "Completed").all()
        elif view_filter == "overdue":
            tasks = [t for t in query.all() if t.is_overdue()]
        else:
            tasks = query.order_by(StudentTask.deadline.asc()).all()

        return jsonify({
            "success": True,
            "tasks": [t.to_dict() for t in tasks],
            "stats": {
                "total_tasks": total_tasks,
                "completed_tasks": completed_tasks,
                "pending_tasks": pending_tasks,
                "overdue_tasks": overdue_tasks,
                "today_tasks": today_tasks_count,
                "today_completed": today_completed_count,
                "weekly_goals": weekly_goals_count,
                "weekly_completed": weekly_completed_count,
                "overall_completion_pct": overall_completion_pct,
                "daily_completion_pct": daily_completion_pct,
                "weekly_completion_pct": weekly_completion_pct
            }
        })
    finally:
        db.close()


@tasks_bp.route("/<student_id>", methods=["POST"])
def create_student_task(student_id):
    """
    Creates a new daily task or weekly goal for a student.
    """
    data = request.get_json() or {}
    title = (data.get("title") or "").strip()
    if not title:
        return jsonify({"success": False, "error": "Task title is required."}), 400

    deadline = (data.get("deadline") or "").strip()
    if not deadline:
        deadline = date.today().isoformat()

    category = data.get("category", "Skill Learning")
    is_weekly_goal = bool(data.get("is_weekly_goal", category == "Weekly Goal"))

    db = SessionLocal()
    try:
        task = StudentTask(
            student_id=student_id,
            title=title,
            description=data.get("description", "").strip(),
            category=category,
            is_weekly_goal=is_weekly_goal,
            start_date=data.get("start_date") or date.today().isoformat(),
            deadline=deadline,
            status=data.get("status", "Not Started"),
            priority=data.get("priority", "Medium")
        )
        db.add(task)
        db.commit()
        db.refresh(task)

        return jsonify({
            "success": True,
            "message": "Task created successfully.",
            "task": task.to_dict()
        }), 201
    except Exception as e:
        db.rollback()
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        db.close()


@tasks_bp.route("/<student_id>/<int:task_id>", methods=["PUT"])
def update_student_task(student_id, task_id):
    """
    Updates an existing task for a student.
    """
    data = request.get_json() or {}
    db = SessionLocal()
    try:
        task = db.query(StudentTask).filter(
            StudentTask.id == task_id,
            StudentTask.student_id == student_id
        ).first()

        if not task:
            return jsonify({"success": False, "error": "Task not found."}), 404

        if "title" in data and data["title"]:
            task.title = data["title"].strip()
        if "description" in data:
            task.description = data["description"].strip()
        if "category" in data and data["category"]:
            task.category = data["category"]
            if task.category == "Weekly Goal":
                task.is_weekly_goal = True
        if "is_weekly_goal" in data:
            task.is_weekly_goal = bool(data["is_weekly_goal"])
        if "start_date" in data:
            task.start_date = data["start_date"]
        if "deadline" in data and data["deadline"]:
            task.deadline = data["deadline"]
        if "status" in data and data["status"]:
            task.status = data["status"]
        if "priority" in data and data["priority"]:
            task.priority = data["priority"]

        task.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(task)

        return jsonify({
            "success": True,
            "message": "Task updated successfully.",
            "task": task.to_dict()
        })
    except Exception as e:
        db.rollback()
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        db.close()


@tasks_bp.route("/<student_id>/<int:task_id>/status", methods=["PATCH"])
def toggle_task_status(student_id, task_id):
    """
    Quick status update (Not Started -> In Progress -> Completed).
    """
    data = request.get_json() or {}
    status = data.get("status")
    
    db = SessionLocal()
    try:
        task = db.query(StudentTask).filter(
            StudentTask.id == task_id,
            StudentTask.student_id == student_id
        ).first()

        if not task:
            return jsonify({"success": False, "error": "Task not found."}), 404

        if status:
            task.status = status
        else:
            # Cycle through statuses
            if task.status == "Not Started":
                task.status = "In Progress"
            elif task.status == "In Progress":
                task.status = "Completed"
            else:
                task.status = "Not Started"

        task.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(task)

        return jsonify({
            "success": True,
            "task": task.to_dict()
        })
    except Exception as e:
        db.rollback()
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        db.close()


@tasks_bp.route("/<student_id>/<int:task_id>", methods=["DELETE"])
def delete_student_task(student_id, task_id):
    """
    Deletes a task.
    """
    db = SessionLocal()
    try:
        task = db.query(StudentTask).filter(
            StudentTask.id == task_id,
            StudentTask.student_id == student_id
        ).first()

        if not task:
            return jsonify({"success": False, "error": "Task not found."}), 404

        db.delete(task)
        db.commit()
        return jsonify({"success": True, "message": "Task deleted successfully."})
    except Exception as e:
        db.rollback()
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        db.close()
