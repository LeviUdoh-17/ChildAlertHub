from flask import Flask, jsonify, request, render_template, redirect, session, url_for
import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash
import os

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
    if 'user_id' not in session:
        # Redirect to login page if user is not authenticated
        return redirect(url_for('login'))
    return render_template('dashboard.html', username=session['username'])

if __name__ == '__main__':
    init_db()
    app.run(debug=True)
