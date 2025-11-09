# Personalized Medicine Recommending System

A Flask-based web application that recommends alternative medicines based on similarity in medical descriptions and usage context. Users can search for a medicine and view suitable alternatives along with their possible side effects. The system includes user authentication and a request submission feature.

## Features

- Medicine alternative recommendation using NLP and cosine similarity
- User authentication (Register / Login / Logout)
- Separate databases for user details and medicine requests
- Users can submit medicine suggestions to be added
- Admin view for reviewing medicine requests

## Tech Stack

| Layer      | Technology |
|-----------|------------|
| Backend   | Flask (Python) |
| Database  | SQLite (SQLAlchemy ORM) |
| ML/NLP    | Scikit-learn, NLTK, CountVectorizer, Cosine Similarity |
| Frontend  | HTML, CSS, JavaScript (Flask Templates) |



## Installation & Setup

### 1. Clone the Repository
```bash

git clone https://github.com/AllenJohnn/Personalized-Medicine-Recommending-System.git
cd Personalized-Medicine-Recommending-System




### 2. Install Dependencies

pip install -r requirements.txt
4. Run the Application
bash
Copy code
python app.py
Then open:

cpp
Copy code
http://127.0.0.1:5000
Recommendation Logic
The system combines Description and Reason text fields.

Applies stemming using Porter Stemmer.

Converts text to vectors using CountVectorizer.

Computes similarity scores with Cosine Similarity.

Displays the most similar medicines and their side effects.

User Authentication
Passwords are securely hashed.

Logged-in users can submit medicine requests.

Admin panel lists all medicine requests at:

bash
Copy code
/admin/medicine_requests
