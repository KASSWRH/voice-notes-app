from flask import Blueprint, render_template

views_bp = Blueprint('views', __name__)

@views_bp.route('/')
def index():
    return render_template('index.html')

@views_bp.route('/tasks')
def tasks():
    return render_template('tasks.html')

@views_bp.route('/reminders')
def reminders():
    return render_template('reminders.html')

@views_bp.route('/archived')
def archived():
    return render_template('index.html', archived=True)