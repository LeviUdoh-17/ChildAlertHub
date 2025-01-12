from flask import Flask, jsonify, request, render_template, redirect, session, url_for
import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash
import os
import smtplib
from email.message import EmailMessage

app = Flask(__name__)

app.secret_key = 'ukaraobong'

DATABASE = 'database.db'

# Connect to SQLite database
def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

# Initialize the database schema
def init_db():
    if os.path.exists(DATABASE):
        os.remove(DATABASE)
    conn = get_db_connection()
    with conn:
        conn.execute('''
            CREATE TABLE users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                first_name TEXT NOT NULL,
                last_name TEXT NOT NULL,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL
            )
        ''')
    conn.close()

conn = get_db_connection()
users = conn.execute('SELECT * FROM users').fetchall()
for user in users:
    print(user)
conn.close()
# Home page route
@app.route('/')
def home():
    return render_template('home.html')

# Login page route
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        data = request.json

        username = data.get('username')
        password = data.get('password')

        # Validate inputs
        if not username or not password:
            return jsonify({'error': 'All fields are required'}), 400

        conn = get_db_connection()
        user = conn.execute('SELECT * FROM users WHERE username = ?', (username,)).fetchone()
        conn.close()

        if user and check_password_hash(user['password'], password):
            # Store session details if necessary
            session['user_id'] = user['id']
            session['username'] = username

            # Redirect to the dashboard (server-side redirection)
            return jsonify({'redirect': url_for('dashboard'), 'message': f'Welcome {username}'}), 200
        else:
            return jsonify({'error': 'Invalid credentials'}), 401
    return render_template('login.html')

# Route to register a user
@app.route('/register', methods=['POST'])
def register():
    data = request.json

    first_name = data.get('firstName')
    last_name = data.get('lastName')
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    # Validate inputs
    if not first_name or not last_name or not username or not email or not password:
        return jsonify({'error': 'All fields are required'}), 400

    hashed_password = generate_password_hash(password)

    conn = get_db_connection()
    try:
        conn.execute(
            'INSERT INTO users (first_name, last_name, username, email, password) VALUES (?, ?, ?, ?, ?)',
            (first_name, last_name, username, email, hashed_password)
        )
        conn.commit()
    except sqlite3.IntegrityError as e:
        if 'username' in str(e):
            return jsonify({'error': 'Username already exists'}), 400
        if 'email' in str(e):
            return jsonify({'error': 'Email already exists'}), 400
    finally:
        conn.close()

    return jsonify({'message': 'User registered successfully'}), 201

# Dashboard page route
@app.route('/dashboard', methods=['GET'])
def dashboard():
    # Assuming user_id is stored in the session after login
    user_id = session.get('user_id')
    if not user_id:
        return "Unauthorized", 401

    conn = get_db_connection()
    user = conn.execute('SELECT first_name, last_name FROM users WHERE id = ?', (user_id,)).fetchone()
    conn.close()

    if not user:
        return "User not found", 404

    # Pass user data to the template
    return render_template('dashboard.html', first_name=user['first_name'], last_name=user['last_name'])

# Placeholder for approved cards
approved_cards = []

@app.route('/submit-card', methods=['POST'])
def submit_card():
    data = request.json
    title = data.get('title')
    content = data.get('content')

    if not title or not content:
        return jsonify({'success': False, 'error': 'Invalid input'}), 400

    # Send approval email (Placeholder logic)
    msg = EmailMessage()
    msg['Subject'] = 'Card Approval Request'
    msg['From'] = 'your_email@example.com'
    msg['To'] = 'approver_email@example.com'
    msg.set_content(f"Title: {title}\nContent: {content}\n\nApprove?")

    try:
        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.starttls()
            server.login('your_email@example.com', 'your_password')
            server.send_message(msg)
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

    return jsonify({'success': True})

@app.route('/approve-card', methods=['POST'])
def approve_card():
    data = request.json
    title = data.get('title')
    content = data.get('content')

    # Add card to approved list (Simulate database entry)
    approved_cards.append({'title': title, 'content': content})
    return jsonify({'success': True})

@app.route('/get-approved-cards', methods=['GET'])
def get_approved_cards():
    return jsonify({'cards': approved_cards})

# logout route
@app.route('/logout', methods=['GET'])
def logout():
    session.pop('user_id', None)
    session.pop('username', None)
    return redirect(url_for('home'))

UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Ensure upload folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/submitMissingReport', methods=['POST'])
def submitMissingReport():
    # Parse text fields
    report_firstname = request.form.get('reportFirstname')
    report_lastname = request.form.get('reportLastname')
    report_height = request.form.get('reportHeight')
    report_age = request.form.get('reportAge')
    report_missing_from = request.form.get('reportMissingFrom')
    report_missing_since = request.form.get('reportMissingSince')
    feedback = request.form.get('feedback')
    personal_firstname = request.form.get('personalFirstname')
    personal_lastname = request.form.get('personalLastname')
    personal_age = request.form.get('personalAge')
    personal_phone_number = request.form.get('personalPhoneNumber')
    personal_email = request.form.get('personalEmail')
    personal_details = request.form.get('personalDetails')
    satisfaction = request.form.get('satisfaction')

    # Handle file uploads
    images = request.files.getlist('images')
    for image in images:
        if image:
            image.save(os.path.join(app.config['UPLOAD_FOLDER'], image.filename))

    # Insert data into database or process it further
    # For now, returning success response
    return jsonify({'success': True, 'message': 'Report submitted successfully.'})

if __name__ == '__main__':
    init_db()
    app.run(debug=True)
