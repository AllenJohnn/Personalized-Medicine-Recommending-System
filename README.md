# Personalized Medicine Recommending System

A professional medicine recommendation and management platform built with Flask, providing intelligent medicine search via TF-IDF similarity, prescription record tracking, and a responsive frontend UI.

## Features

- **Intelligent Search:** Advanced medicine matching using TF-IDF cosine similarity and Porter stemming for robust results.
- **Dynamic Images:** Integrates Bing Image Search thumbnails for live medicine imagery.
- **User Dashboard:** Track search history, save bookmarks, and upload previous medical prescriptions for personal record keeping.
- **Dark Mode Support:** Crisp, true-black AMOLED dark mode with seamless transition.
- **Authentication:** Secure JWT-based authentication with refresh tokens and blocklist support.
- **Administration:** Admin panel for reviewing medicine requests and tracking platform usage statistics.

## Project Structure

- `app.py` - Application entry point.
- `backend/` - Flask application package (routes, models, services, config).
- `static_frontend/` - Static HTML/JS/CSS frontend served directly by Flask.
- `Medicine_Details.csv` - The core dataset (9,720 medicines) used by the recommender engine.

## Prerequisites

- Python 3.13+
- Required packages (see `requirements.txt`)

## Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <repository_url>
   cd Personalized-Medicine-Recommending-System
   ```

2. **Set up a virtual environment:**
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On Mac/Linux:
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment Configuration:**
   Copy `.env.example` to `.env` (if provided) or configure your environment variables.
   * `SECRET_KEY`: Flask secret key.
   * `JWT_SECRET_KEY`: JWT signing key.
   * `ADMIN_USERNAME`: The username of the user who should receive admin privileges.

5. **Run the Application:**
   ```bash
   python app.py
   ```
   The backend and frontend will be served at `http://127.0.0.1:5000/`.

## Architecture

- **Backend Framework:** Flask (Python)
- **Database:** SQLite (managed via SQLAlchemy ORM)
- **Security:** Flask-JWT-Extended (auth), Flask-WTF (CSRF), Werkzeug (password hashing)
- **Machine Learning / NLP:** Scikit-Learn (TF-IDF Vectorizer), NLTK (PorterStemmer)
- **Frontend UI:** HTML5, Vanilla JavaScript, CSS3, Bootstrap 5, FontAwesome

## License

This project is licensed under the MIT License.
