from flask import Flask, jsonify, request, render_template, redirect, session
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
    if not os.path.exists(DATABASE):
        conn = get_db_connection()
        with conn:
            conn.execute('''
                CREATE TABLE users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    password TEXT NOT NULL,
                    user_type TEXT NOT NULL
                )
            ''')
        conn.close()

# Home page route
@app.route('/')
def home():
    return render_template('home.html')

# Route to register a user
@app.route('/register', methods=['POST'])
def register():
    data = request.json

    username = data.get('username')
    password = data.get('password')
    user_type = data.get('user_type')  # 'Public' or 'Authority'

    # Validate inputs
    if not username or not password or not user_type:
        return jsonify({'error': 'All fields are required'}), 400

    if user_type not in ['Public', 'Authority']:
        return jsonify({'error': 'Invalid user type'}), 400

    hashed_password = generate_password_hash(password)

    conn = get_db_connection()
    try:
        conn.execute(
            'INSERT INTO users (username, password, user_type) VALUES (?, ?, ?)',
            (username, hashed_password, user_type)
        )
        conn.commit()
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Username already exists'}), 400
    finally:
        conn.close()

    return jsonify({'message': 'User registered successfully'}), 201

# Route to login a user
@app.route('/login', methods=['POST'])
def login():
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
        return jsonify({'redirect': '/dashboard', 'message': f'Welcome {username}'}), 200
    else:
        return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/dashboard', methods=['GET'])
def dashboard():
    if 'user_id' not in session:
        # Redirect to login page if user is not authenticated
        return redirect('/login')
    return render_template('dashboard.html', username=session['username'])

if __name__ == '__main__':
    init_db()
    app.run(debug=True)
