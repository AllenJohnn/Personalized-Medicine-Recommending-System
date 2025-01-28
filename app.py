from flask import Flask, request, render_template, jsonify, redirect
import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from nltk.stem.porter import PorterStemmer
import os

# Initialize Flask app
app = Flask(__name__)

# Initialize the PorterStemmer
ps = PorterStemmer()

# Function to apply stemming to text
def stem(text):
    return " ".join([ps.stem(word) for word in text.split() if word])

# Load and preprocess the dataset
csv_path = os.path.join(os.path.dirname(__file__), 'medicine.csv')
df = pd.read_csv(csv_path)

# Drop rows where Description or Reason is missing
df.dropna(subset=["Description", "Reason"], inplace=True)

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

# Function to suggest alternative medicines
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
    alternatives = [df.iloc[i[0]]["Drug_Name"] for i in medicines_list if distances[i[0]] > 0]

    return alternatives if alternatives else ["No alternatives found"]

# New route for the opening page
@app.route('/')
def opening():
    return render_template('opening.html')

# Route for the home page
@app.route('/home')
def home():
    return render_template('home.html')

# Route to get the list of medicines dynamically
@app.route('/medicines')
def get_medicines():
    medicines = sorted(df["Drug_Name"].unique())  # Fetch unique medicine names
    return jsonify(medicines)  # Return as JSON

# Route for the results page
@app.route('/results', methods=['POST'])
def results():
    # Get the medicine name from the form
    medicine_name = request.form.get('medicine_name', '').strip()
    if not medicine_name:
        return render_template('results.html', medicine_name=None, alternatives=["No input provided"])

    # Suggest alternatives
    alternatives = suggest_alternatives(medicine_name)

    # Render the results page
    return render_template('results.html', medicine_name=medicine_name, alternatives=alternatives)

# Run the app
if __name__ == '__main__':
    app.run(debug=True)
