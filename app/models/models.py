from datetime import datetime
from app import db

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username
        }

class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    color = db.Column(db.String(20), default="#2196F3")
    
    notes = db.relationship('Note', backref='category', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'color': self.color
        }

class Note(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    content = db.Column(db.Text, nullable=True)
    audio_url = db.Column(db.String(255), nullable=True)
    duration = db.Column(db.Integer, nullable=True)  # in seconds
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_archived = db.Column(db.Boolean, default=False)
    
    tasks = db.relationship('Task', backref='note', lazy=True, cascade="all, delete-orphan")
    reminders = db.relationship('Reminder', backref='note', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content,
            'audioUrl': self.audio_url,
            'duration': self.duration,
            'categoryId': self.category_id,
            'createdAt': self.created_at.isoformat(),
            'isArchived': self.is_archived,
            'tasks': [task.to_dict() for task in self.tasks]
        }

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.String(255), nullable=False)
    is_completed = db.Column(db.Boolean, default=False)
    note_id = db.Column(db.Integer, db.ForeignKey('note.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    reminders = db.relationship('Reminder', backref='task', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.id,
            'content': self.content,
            'isCompleted': self.is_completed,
            'noteId': self.note_id,
            'createdAt': self.created_at.isoformat()
        }

class Reminder(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    reminder_time = db.Column(db.DateTime, nullable=False)
    note_id = db.Column(db.Integer, db.ForeignKey('note.id'), nullable=True)
    task_id = db.Column(db.Integer, db.ForeignKey('task.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'reminderTime': self.reminder_time.isoformat(),
            'noteId': self.note_id,
            'taskId': self.task_id,
            'createdAt': self.created_at.isoformat()
        }