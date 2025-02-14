from flask import Flask, request, render_template, jsonify, redirect, url_for, session
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from nltk.stem.porter import PorterStemmer
import os

# Initialize Flask app
app = Flask(__name__)

# Secret key for session management
app.secret_key = 'your_secret_key'

# Database setup
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'  # SQLite database
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Initialize the PorterStemmer for text processing
ps = PorterStemmer()

# Function to apply stemming to text
def stem(text):
    return " ".join([ps.stem(word) for word in text.split() if word])

# Load and preprocess the dataset
csv_path = os.path.join(os.path.dirname(__file__), 'medicine.csv')
df = pd.read_csv(csv_path)

# Drop rows where Description, Reason, or Side_Effects is missing
df.dropna(subset=["Description", "Reason", "Side_Effects"], inplace=True)

# Create the 'tags' column by combining 'Description' and 'Reason'
df["tags"] = (df["Description"].fillna("") + " " + df["Reason"].fillna("")).str.lower()

# Apply stemming to the 'tags' column
df["tags"] = df["tags"].apply(stem)

# Remove rows with empty 'tags' after processing
df = df[df["tags"].str.strip() != ""]

# Create a CountVectorizer instance
cv = CountVectorizer(stop_words="english", max_features=5000)

# Fit and transform the 'tags' column into vectors
vectors = cv.fit_transform(df["tags"]).toarray()

# Compute the cosine similarity matrix
similarity = cosine_similarity(vectors)

# Function to suggest alternative medicines along with side effects
def suggest_alternatives(medicine_name):
    matches = df[df["Drug_Name"].str.lower() == medicine_name.lower()]
    if matches.empty:
        return ["No alternatives found"]

    # Find the index of the input medicine
    idx = matches.index[0]

    # Get similarity scores for the input medicine
    distances = similarity[idx]

    # Sort and get the top 5 similar medicines (excluding itself)
    medicines_list = sorted(list(enumerate(distances)), key=lambda x: x[1], reverse=True)[1:6]
    alternatives = [(df.iloc[i[0]]["Drug_Name"], df.iloc[i[0]]["Side_Effects"]) for i in medicines_list if distances[i[0]] > 0]

    return alternatives if alternatives else ["No alternatives found"]

# User model for login/registration
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(150), nullable=False)

    def __repr__(self):
        return f"User('{self.username}')"

# Function to create tables before app starts
def create_tables():
    with app.app_context():
        db.create_all()

# Route for the opening page (Redirects to opening.html)
@app.route('/')
def opening():
    return render_template('opening.html')

# Route for the home page (Redirects to home.html)
@app.route('/home')
def home():
    return render_template('home.html')

# Route for the about page (Redirects to about.html)
@app.route('/about')
def about():
    return render_template('about.html')

# Route for the contact page (Redirects to login.html)
@app.route('/contact')
def contact():
    return render_template('login.html')

# Route to get the list of medicines dynamically
@app.route('/medicines')
def get_medicines():
    medicines = sorted(df["Drug_Name"].unique())  # Fetch unique medicine names
    return jsonify(medicines)  # Return as JSON

# Route for the results page (Handles form submission)
@app.route('/results', methods=['POST'])
def results():
    # Get the medicine name from the form
    medicine_name = request.form.get('medicine_name', '').strip()
    if not medicine_name:
        return render_template('results.html', medicine_name=None, alternatives=["No input provided"])

    # Suggest alternatives along with side effects
    alternatives = suggest_alternatives(medicine_name)

    # Render the results page
    return render_template('results.html', medicine_name=medicine_name, alternatives=alternatives)

# Register route to handle user registration
@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        confirm_password = request.form.get('confirm_password')

        # Check if passwords match
        if password != confirm_password:
            return render_template('registernow.html', message="Passwords do not match.")

        # Check if the username already exists
        existing_user = User.query.filter_by(username=username).first()
        if existing_user:
            return render_template('registernow.html', message="Username already exists.")

        # Hash the password (PBKDF2 by default)
        hashed_password = generate_password_hash(password)

        # Create a new user and add to the database
        new_user = User(username=username, password=hashed_password)
        db.session.add(new_user)
        db.session.commit()

        return redirect(url_for('login'))

    return render_template('registernow.html')

# Login route to handle user login
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')

        user = User.query.filter_by(username=username).first()

        # Check if user exists and password is correct
        if user and check_password_hash(user.password, password):
            session['user_id'] = user.id
            return redirect(url_for('home'))
        else:
            return render_template('login.html', message="Invalid username or password.")

    return render_template('login.html')

# Logout route to log out the user
@app.route('/logout')
def logout():
    session.pop('user_id', None)
    return redirect(url_for('login'))

# Run the app
if __name__ == '__main__':
    create_tables()  # Ensure tables are created before running the app
    app.run(debug=True)
