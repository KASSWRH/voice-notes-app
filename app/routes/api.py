from flask import Blueprint, request, jsonify
from datetime import datetime
import os
import uuid
from werkzeug.utils import secure_filename
from app.models.models import db, Category, Note, Task, Reminder
from app.utils.task_extractor import extract_tasks

api_bp = Blueprint('api', __name__)

# Category routes
@api_bp.route('/categories', methods=['GET'])
def get_categories():
    categories = Category.query.all()
    return jsonify([category.to_dict() for category in categories])

@api_bp.route('/categories', methods=['POST'])
def create_category():
    try:
        data = request.json
        if not data or 'name' not in data:
            return jsonify({'message': 'Name is required'}), 400
        
        # Create category and set properties individually
        category = Category()
        category.name = data['name']
        category.color = data.get('color', '#2196F3')
        
        db.session.add(category)
        try:
            db.session.commit()
            return jsonify(category.to_dict()), 201
        except Exception as e:
            db.session.rollback()
            print(f"Database error during category creation: {str(e)}")
            return jsonify({'message': 'Database error while saving category', 'error': str(e)}), 500
    except Exception as e:
        print(f"Unexpected error during category creation: {str(e)}")
        return jsonify({'message': 'An unexpected error occurred', 'error': str(e)}), 500

@api_bp.route('/categories/<int:id>', methods=['PUT'])
def update_category(id):
    category = Category.query.get(id)
    if not category:
        return jsonify({'message': 'Category not found'}), 404
    
    data = request.json
    if data and 'name' in data:
        category.name = data['name']
    if data and 'color' in data:
        category.color = data['color']
    
    db.session.commit()
    return jsonify(category.to_dict())

@api_bp.route('/categories/<int:id>', methods=['DELETE'])
def delete_category(id):
    category = Category.query.get(id)
    if not category:
        return jsonify({'message': 'Category not found'}), 404
    
    db.session.delete(category)
    db.session.commit()
    return '', 204

# Note routes
@api_bp.route('/notes', methods=['GET'])
def get_notes():
    notes = Note.query.filter_by(is_archived=False).all()
    return jsonify([note.to_dict() for note in notes])

@api_bp.route('/notes/archived', methods=['GET'])
def get_archived_notes():
    notes = Note.query.filter_by(is_archived=True).all()
    return jsonify([note.to_dict() for note in notes])

@api_bp.route('/notes/<int:id>', methods=['GET'])
def get_note(id):
    note = Note.query.get(id)
    if not note:
        return jsonify({'message': 'Note not found'}), 404
    
    return jsonify(note.to_dict())

@api_bp.route('/categories/<int:id>/notes', methods=['GET'])
def get_notes_by_category(id):
    notes = Note.query.filter_by(category_id=id, is_archived=False).all()
    return jsonify([note.to_dict() for note in notes])

@api_bp.route('/notes', methods=['POST'])
def create_note():
    try:
        data = request.json
        if not data or 'title' not in data:
            return jsonify({'message': 'Title is required'}), 400
        
        # Create new Note object and set properties individually to avoid constructor issues
        note = Note()
        note.title = data['title']
        note.content = data.get('content')
        note.audio_url = data.get('audioUrl')
        note.duration = data.get('duration')
        note.category_id = data.get('categoryId')
        note.is_archived = False
        
        # Add to session and commit with error handling
        db.session.add(note)
        try:
            db.session.commit()
            return jsonify(note.to_dict()), 201
        except Exception as e:
            db.session.rollback()
            # Log the specific error for debugging
            print(f"Database error during note creation: {str(e)}")
            return jsonify({'message': 'Database error while saving note', 'error': str(e)}), 500
    except Exception as e:
        # Handle any other unexpected errors
        print(f"Unexpected error during note creation: {str(e)}")
        return jsonify({'message': 'An unexpected error occurred', 'error': str(e)}), 500

@api_bp.route('/notes/<int:id>', methods=['PUT'])
def update_note(id):
    note = Note.query.get(id)
    if not note:
        return jsonify({'message': 'Note not found'}), 404
    
    data = request.json
    if data and 'title' in data:
        note.title = data['title']
    if data and 'content' in data:
        note.content = data['content']
    if data and 'audioUrl' in data:
        note.audio_url = data['audioUrl']
    if data and 'duration' in data:
        note.duration = data['duration']
    if data and 'categoryId' in data:
        note.category_id = data['categoryId']
    if data and 'isArchived' in data:
        note.is_archived = data['isArchived']
    
    db.session.commit()
    return jsonify(note.to_dict())

@api_bp.route('/notes/<int:id>', methods=['DELETE'])
def delete_note(id):
    note = Note.query.get(id)
    if not note:
        return jsonify({'message': 'Note not found'}), 404
    
    db.session.delete(note)
    db.session.commit()
    return '', 204

@api_bp.route('/notes/<int:id>/archive', methods=['PUT'])
def archive_note(id):
    note = Note.query.get(id)
    if not note:
        return jsonify({'message': 'Note not found'}), 404
    
    note.is_archived = True
    db.session.commit()
    return jsonify(note.to_dict())

@api_bp.route('/notes/<int:id>/unarchive', methods=['PUT'])
def unarchive_note(id):
    note = Note.query.get(id)
    if not note:
        return jsonify({'message': 'Note not found'}), 404
    
    note.is_archived = False
    db.session.commit()
    return jsonify(note.to_dict())

# Task routes
@api_bp.route('/tasks', methods=['GET'])
def get_tasks():
    completed = request.args.get('completed', 'false')
    if completed.lower() == 'true':
        tasks = Task.query.filter_by(is_completed=True).all()
    else:
        tasks = Task.query.filter_by(is_completed=False).all()
    
    return jsonify([task.to_dict() for task in tasks])

@api_bp.route('/notes/<int:id>/tasks', methods=['GET'])
def get_tasks_by_note(id):
    tasks = Task.query.filter_by(note_id=id).all()
    return jsonify([task.to_dict() for task in tasks])

@api_bp.route('/tasks', methods=['POST'])
def create_task():
    try:
        data = request.json
        if not data or 'content' not in data:
            return jsonify({'message': 'Content is required'}), 400
        
        # Create task and set properties individually
        task = Task()
        task.content = data['content']
        task.is_completed = data.get('isCompleted', False)
        task.note_id = data.get('noteId')
        
        db.session.add(task)
        try:
            db.session.commit()
            return jsonify(task.to_dict()), 201
        except Exception as e:
            db.session.rollback()
            print(f"Database error during task creation: {str(e)}")
            return jsonify({'message': 'Database error while saving task', 'error': str(e)}), 500
    except Exception as e:
        print(f"Unexpected error during task creation: {str(e)}")
        return jsonify({'message': 'An unexpected error occurred', 'error': str(e)}), 500

@api_bp.route('/tasks/<int:id>', methods=['PUT'])
def update_task(id):
    task = Task.query.get(id)
    if not task:
        return jsonify({'message': 'Task not found'}), 404
    
    data = request.json
    if data and 'content' in data:
        task.content = data['content']
    if data and 'isCompleted' in data:
        task.is_completed = data['isCompleted']
    if data and 'noteId' in data:
        task.note_id = data['noteId']
    
    db.session.commit()
    return jsonify(task.to_dict())

@api_bp.route('/tasks/<int:id>', methods=['DELETE'])
def delete_task(id):
    task = Task.query.get(id)
    if not task:
        return jsonify({'message': 'Task not found'}), 404
    
    db.session.delete(task)
    db.session.commit()
    return '', 204

# Reminder routes
@api_bp.route('/reminders', methods=['GET'])
def get_reminders():
    reminders = Reminder.query.all()
    return jsonify([reminder.to_dict() for reminder in reminders])

@api_bp.route('/reminders/today', methods=['GET'])
def get_today_reminders():
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    tomorrow = today.replace(day=today.day+1)
    reminders = Reminder.query.filter(
        Reminder.reminder_time >= today,
        Reminder.reminder_time < tomorrow
    ).order_by(Reminder.reminder_time).all()
    return jsonify([reminder.to_dict() for reminder in reminders])

@api_bp.route('/reminders/upcoming', methods=['GET'])
def get_upcoming_reminders():
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    tomorrow = today.replace(day=today.day+1)
    reminders = Reminder.query.filter(
        Reminder.reminder_time >= tomorrow
    ).order_by(Reminder.reminder_time).all()
    return jsonify([reminder.to_dict() for reminder in reminders])

@api_bp.route('/reminders/past', methods=['GET'])
def get_past_reminders():
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    reminders = Reminder.query.filter(
        Reminder.reminder_time < today
    ).order_by(Reminder.reminder_time.desc()).all()
    return jsonify([reminder.to_dict() for reminder in reminders])

@api_bp.route('/reminders', methods=['POST'])
def create_reminder():
    try:
        data = request.json
        if not data or 'title' not in data or 'reminderTime' not in data:
            return jsonify({'message': 'Title and reminderTime are required'}), 400
        
        try:
            reminder_time = datetime.fromisoformat(data['reminderTime'].replace('Z', '+00:00'))
        except ValueError:
            return jsonify({'message': 'Invalid reminderTime format'}), 400
        
        # Create reminder and set properties individually
        reminder = Reminder()
        reminder.title = data['title']
        reminder.description = data.get('description')
        reminder.reminder_time = reminder_time
        reminder.note_id = data.get('noteId')
        reminder.task_id = data.get('taskId')
        
        db.session.add(reminder)
        try:
            db.session.commit()
            return jsonify(reminder.to_dict()), 201
        except Exception as e:
            db.session.rollback()
            print(f"Database error during reminder creation: {str(e)}")
            return jsonify({'message': 'Database error while saving reminder', 'error': str(e)}), 500
    except Exception as e:
        print(f"Unexpected error during reminder creation: {str(e)}")
        return jsonify({'message': 'An unexpected error occurred', 'error': str(e)}), 500

@api_bp.route('/reminders/<int:id>', methods=['PUT'])
def update_reminder(id):
    reminder = Reminder.query.get(id)
    if not reminder:
        return jsonify({'message': 'Reminder not found'}), 404
    
    data = request.json
    if data and 'title' in data:
        reminder.title = data['title']
    if data and 'description' in data:
        reminder.description = data['description']
    if data and 'reminderTime' in data:
        try:
            reminder.reminder_time = datetime.fromisoformat(data['reminderTime'].replace('Z', '+00:00'))
        except ValueError:
            return jsonify({'message': 'Invalid reminderTime format'}), 400
    if data and 'noteId' in data:
        reminder.note_id = data['noteId']
    if data and 'taskId' in data:
        reminder.task_id = data['taskId']
    
    db.session.commit()
    return jsonify(reminder.to_dict())

@api_bp.route('/reminders/<int:id>', methods=['DELETE'])
def delete_reminder(id):
    reminder = Reminder.query.get(id)
    if not reminder:
        return jsonify({'message': 'Reminder not found'}), 404
    
    db.session.delete(reminder)
    db.session.commit()
    return '', 204

# Extract tasks from text
@api_bp.route('/extract-tasks', methods=['POST'])
def extract_tasks_endpoint():
    if not request.json or 'text' not in request.json:
        return jsonify({'message': 'Text is required'}), 400
    
    text = request.json['text']
    extracted_tasks = extract_tasks(text)
    
    return jsonify({'tasks': extracted_tasks})

# Audio upload route
@api_bp.route('/upload-audio', methods=['POST'])
def upload_audio():
    if 'audio' not in request.files:
        return jsonify({'message': 'No audio file provided'}), 400
    
    audio_file = request.files['audio']
    if audio_file.filename == '':
        return jsonify({'message': 'No selected file'}), 400
    
    filename = secure_filename(f"{uuid.uuid4()}.webm")
    upload_folder = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'static', 'uploads')
    os.makedirs(upload_folder, exist_ok=True)
    
    file_path = os.path.join(upload_folder, filename)
    audio_file.save(file_path)
    
    audio_url = f"/static/uploads/{filename}"
    return jsonify({'audioUrl': audio_url}), 201