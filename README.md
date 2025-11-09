# Personalized Medicine Recommending System

A Flask-based web application that recommends alternative medicines based on similarity in medical descriptions and usage context. Users can search for a medicine and view suitable alternatives along with their possible side effects. The system includes user authentication and a request submission feature.

## Features

- Medicine alternative recommendation using NLP and cosine similarity
- User authentication (Register / Login / Logout)
- Separate databases for user details and medicine requests
- Users can submit medicine suggestions to be added
- Admin view to review submitted medicine requests

## Tech Stack

| Layer      | Technology |
|-----------|------------|
| Backend   | Flask (Python) |
| Database  | SQLite (SQLAlchemy ORM) |
| ML/NLP    | Scikit-learn, NLTK (Porter Stemmer), CountVectorizer, Cosine Similarity |
| Frontend  | HTML, CSS, JavaScript (Flask Templates) |

## Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/AllenJohnn/Personalized-Medicine-Recommending-System.git
cd Personalized-Medicine-Recommending-System


```
### 2. Install Dependencies
```bash
pip install -r requirements.txt


```
### 3. Run the Application
```bash
python app.py


```
### 4. Open in browser:
```bash
http://127.0.0.1:5000






