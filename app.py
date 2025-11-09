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

# Secret key for session management (More secure)
app.secret_key = os.urandom(24)

# Database setup
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'  # SQLite for user authentication
app.config['SQLALCHEMY_BINDS'] = {
    'requests': 'sqlite:///requests.db'  # Separate database for medicine requests
}
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize database
db = SQLAlchemy(app)

# Initialize the PorterStemmer for text processing
ps = PorterStemmer()

def stem(text):
    return " ".join([ps.stem(word) for word in text.split() if word])

# Load and preprocess the dataset
csv_path = os.path.join(os.path.dirname(__file__), 'medicine.csv')
df = pd.read_csv(csv_path)

df.dropna(subset=["Description", "Reason", "Side_Effects"], inplace=True)
df["tags"] = (df["Description"].fillna("") + " " + df["Reason"].fillna("")).str.lower()
df["tags"] = df["tags"].apply(stem)
df = df[df["tags"].str.strip() != ""]

cv = CountVectorizer(stop_words="english", max_features=5000)
vectors = cv.fit_transform(df["tags"]).toarray()
similarity = cosine_similarity(vectors)

def suggest_alternatives(medicine_name):
    matches = df[df["Drug_Name"].str.lower() == medicine_name.lower()]
    if matches.empty:
        return ["No alternatives found"]
    idx = matches.index[0]
    distances = similarity[idx]
    medicines_list = sorted(list(enumerate(distances)), key=lambda x: x[1], reverse=True)[1:6]
    alternatives = [(df.iloc[i[0]]["Drug_Name"], df.iloc[i[0]]["Side_Effects"]) for i in medicines_list if distances[i[0]] > 0]
    return alternatives if alternatives else ["No alternatives found"]

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(150), nullable=False)

class MedicineRequest(db.Model):
    __bind_key__ = 'requests'
    __tablename__ = 'medicine_requests'
    id = db.Column(db.Integer, primary_key=True)
    medicine_name = db.Column(db.String(200), nullable=False)
    details = db.Column(db.Text, nullable=False)
    requested_by = db.Column(db.Integer, nullable=True)

def create_tables():
    with app.app_context():
        db.create_all()

@app.route('/')
def opening():
    return render_template('opening.html')

@app.route('/home')
def home():
    return render_template('home.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/contact')
def contact():
    return render_template('contact.html')

@app.route('/medicines')
def get_medicines():
    medicines = sorted(df["Drug_Name"].unique())
    return jsonify(medicines)

@app.route('/results', methods=['POST'])
def results():
    medicine_name = request.form.get('medicine_name', '').strip()
    if not medicine_name:
        return render_template('results.html', medicine_name=None, alternatives=["No input provided"])
    alternatives = suggest_alternatives(medicine_name)
    return render_template('results.html', medicine_name=medicine_name, alternatives=alternatives)

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        confirm_password = request.form.get('confirm_password')
        if password != confirm_password:
            return render_template('registernow.html', message="Passwords do not match.")
        existing_user = User.query.filter_by(username=username).first()
        if existing_user:
            return render_template('registernow.html', message="Username already exists.")
        hashed_password = generate_password_hash(password)
        new_user = User(username=username, password=hashed_password)
        db.session.add(new_user)
        db.session.commit()
        return redirect(url_for('login'))
    return render_template('registernow.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        user = User.query.filter_by(username=username).first()
        if user and check_password_hash(user.password, password):
            session['user_id'] = user.id
            return redirect(url_for('home'))
        else:
            return render_template('login.html', message="Invalid username or password.")
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.pop('user_id', None)
    return redirect(url_for('login'))

@app.route('/request_medicine', methods=['POST'])
def request_medicine():
    if 'user_id' not in session:
        return jsonify({"message": "You must be logged in to submit a request."}), 403

    data = request.get_json()
    medicine_name = data.get('medicine_name')
    details = data.get('details')

    if not medicine_name or not details:
        return jsonify({"message": "All fields are required."}), 400

    new_request = MedicineRequest(medicine_name=medicine_name, details=details, requested_by=session['user_id'])
    db.session.add(new_request)
    db.session.commit()

    return jsonify({"message": "Request submitted successfully!"})

@app.route('/admin/medicine_requests')
def admin_medicine_requests():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    requests = MedicineRequest.query.all()
    return render_template('admin_requests.html', requests=requests)

if __name__ == '__main__':
    create_tables()
    app.run(debug=True)
