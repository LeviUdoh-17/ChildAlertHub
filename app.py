from flask import Flask, jsonify, request, render_template, redirect, session, url_for, send_from_directory
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
         # Create the approved_cards table
        conn.execute('''
            CREATE TABLE approved_cards (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                firstname TEXT NOT NULL,
                lastname TEXT NOT NULL,
                missingFrom TEXT NOT NULL,
                missingSince TEXT NOT NULL,
                height TEXT,
                age TEXT,
                image TEXT NOT NULL,
                details TEXT,
                reporter_firstname TEXT NOT NULL,
                reporter_lastname TEXT NOT NULL,
                reporter_age TEXT,
                reporter_phone TEXT NOT NULL,
                reporter_email TEXT NOT NULL,
                reporter_details TEXT,
                satisfaction TEXT
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

# Configuration for file uploads
app.config['UPLOAD_FOLDER'] = 'uploads'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Placeholder for pending and approved cards
pending_cards = []
approved_cards = []

@app.route('/submit-card', methods=['POST'])
def submit_card():
    # Ensure 'images' is in the files
    image = request.files.get('images')
    if not image:
        return jsonify({'success': False, 'error': 'No image provided'}), 400

    # Parse text fields from the form data
    report_firstname = request.form.get('reportFirstname', '')
    report_lastname = request.form.get('reportLastname', '')
    report_height = request.form.get('reportHeight', '')
    report_age = request.form.get('reportAge', '')
    report_missing_from = request.form.get('reportMissingFrom', '')
    report_missing_since = request.form.get('reportMissingSince', '')
    feedback = request.form.get('feedback', '')
    personal_firstname = request.form.get('personalFirstname', '')
    personal_lastname = request.form.get('personalLastname', '')
    personal_age = request.form.get('personalAge', '')
    personal_phone_number = request.form.get('personalPhoneNumber', '')
    personal_email = request.form.get('personalEmail', '')
    personal_details = request.form.get('personalDetails', '')
    satisfaction = request.form.get('satisfaction', '')

    # Save the image temporarily for approval
    image_path = os.path.join(app.config['UPLOAD_FOLDER'], image.filename)
    image.save(image_path)

    # Store the card in pending cards
    card_id = len(pending_cards) + 1
    pending_cards.append({
        'id': card_id,
        'firstname': report_firstname,
        'lastname': report_lastname,
        'missingFrom': report_missing_from,
        'missingSince': report_missing_since,
        'height': report_height,
        'age': report_age,
        'image': image.filename,
        'details': feedback,
        'reporter_firstname': personal_firstname,
        'reporter_lastname': personal_lastname,
        'reporter_age': personal_age,
        'reporter_phone': personal_phone_number,
        'reporter_email': personal_email,
        'reporter_details': personal_details,
        'satisfaction': satisfaction
    })

    # Send approval email
    msg = EmailMessage()
    msg['Subject'] = 'Card Approval Request'
    msg['From'] = 'prolev.99@gmail.com'
    msg['To'] = 'leviudoh17@gmail.com'
    approval_link = f"https://childalerthub.onrender.com/approve-card/{card_id}"
    msg.set_content(f"""
Details of Missing Person
{satisfaction}

Full name: {report_firstname} {report_lastname}
Was missing from: {report_missing_from} since {report_missing_since}
You should also know that {feedback}

Details of the Person Reporting
Full name: {personal_firstname} {personal_lastname}
Phone number: {personal_phone_number}
Email address: {personal_email}
More details: {personal_details}

Click here to approve: {approval_link}
""")
    msg.add_alternative(f"""
<html>
    <body>
        <h2>Details of Missing Person</h2>
        <p>{satisfaction}</p>
        <p><strong>Full name:</strong> {report_firstname} {report_lastname}</p>
        <p><strong>Was missing from:</strong> {report_missing_from} since {report_missing_since}</p>
        <p><strong>You should also know that:</strong> {feedback}</p>
        <p><strong>An image of the missing person is attached below:</strong></p>
        <img src="cid:image1" style="display: block; margin-left: auto; margin-right: auto; width: 300px; height: auto;" alt="Missing Person Image">
        <h2>Details of the Person Reporting</h2>
        <p><strong>Full name:</strong> {personal_firstname} {personal_lastname}</p>
        <p><strong>Phone number:</strong> {personal_phone_number}</p>
        <p><strong>Email address:</strong> {personal_email}</p>
        <p><strong>More details:</strong> {personal_details}</p>
        <p><a href="{approval_link}">Click here to approve</a></p>
    </body>
</html>
""", subtype='html')

    with open(image_path, 'rb') as img:
        msg.get_payload()[1].add_related(img.read(), maintype='image', subtype=image.filename.split('.')[-1], cid='image1')

    PASSCODE = 'pegb axxi pncx vctw'
    try:
        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.starttls()
            server.login('prolev.99@gmail.com', PASSCODE)
            server.send_message(msg)
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

    return jsonify({'success': True, 'message': 'Approval request sent successfully!'})

# Serve files from the uploads folder
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory('uploads', filename)

@app.route('/approve-card/<int:card_id>', methods=['GET'])
def approve_card(card_id):
    # Find card in pending list
    card = next((c for c in pending_cards if c['id'] == card_id), None)
    if not card:
        return jsonify({'success': False, 'error': 'Card not found'}), 404

    # Insert card into the approved_cards table
    conn = get_db_connection()
    conn.execute('''
        INSERT INTO approved_cards (
            firstname, lastname, missingFrom, missingSince, height, age, image, details,
            reporter_firstname, reporter_lastname, reporter_age, reporter_phone, reporter_email,
            reporter_details, satisfaction
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        card['firstname'], card['lastname'], card['missingFrom'], card['missingSince'],
        card['height'], card['age'], card['image'], card['details'],
        card['reporter_firstname'], card['reporter_lastname'], card['reporter_age'],
        card['reporter_phone'], card['reporter_email'], card['reporter_details'], card['satisfaction']
    ))
    conn.commit()
    conn.close()

    # Remove card from pending list
    pending_cards.remove(card)

    return jsonify({'success': True, 'message': f'Card {card_id} approved!'})

@app.route('/approve-card', methods=['POST'])
def approve_card_manual():
    data = request.json
    card_id = data.get('id')

    # Find card in pending list
    card = next((c for c in pending_cards if c['id'] == card_id), None)
    if not card:
        return jsonify({'success': False, 'error': 'Card not found'}), 404

    # Move card to approved cards
    approved_cards.append(card)
    pending_cards.remove(card)

    return jsonify({'success': True, 'message': f'Card {card_id} manually approved!'})

@app.route('/get-approved-cards', methods=['GET'])
def get_approved_cards():
    return jsonify({'cards': approved_cards})

@app.route('/get-card-details/<int:card_id>', methods=['GET'])
def get_card_details(card_id):
    conn = get_db_connection()
    card = conn.execute('SELECT * FROM approved_cards WHERE id = ?', (card_id,)).fetchone()
    conn.close()
    if card is None:
        return jsonify({'error': 'Card not found'}), 404
    return jsonify(dict(card))
    
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
    print("Database initialized")
    app.run(debug=True)
