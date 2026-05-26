from __future__ import annotations

import re
from difflib import get_close_matches
from functools import lru_cache
from pathlib import Path
from typing import Any

import pandas as pd
from nltk.stem.porter import PorterStemmer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


BASE_DIR = Path(__file__).resolve().parent.parent.parent
DEFAULT_CSV_PATH = BASE_DIR / "medicine.csv"
ps = PorterStemmer()


def stem_text(text: str) -> str:
    tokens = re.findall(r"[A-Za-z0-9]+", str(text).lower())
    return " ".join(ps.stem(token) for token in tokens if token)


@lru_cache(maxsize=1)
def load_recommender(csv_path: str | None = None) -> dict[str, Any]:
    source_path = Path(csv_path or DEFAULT_CSV_PATH)
    frame = pd.read_csv(source_path)

    required_columns = ["Drug_Name", "Reason", "Description", "Side_Effects"]
    frame = frame.dropna(subset=required_columns).copy()
    for column in required_columns:
        frame[column] = frame[column].astype(str).str.strip()

    frame["tags"] = (
        frame["Reason"].fillna("")
        + " "
        + frame["Description"].fillna("")
        + " "
        + frame["Side_Effects"].fillna("")
    ).str.lower().map(stem_text)
    frame = frame[frame["tags"].str.strip() != ""].reset_index(drop=True)

    vectorizer = TfidfVectorizer(max_features=8000, ngram_range=(1, 2))
    tfidf_matrix = vectorizer.fit_transform(frame["tags"])
    similarity_matrix = cosine_similarity(tfidf_matrix)

    return {
        "frame": frame,
        "vectorizer": vectorizer,
        "similarity_matrix": similarity_matrix,
    }


def medicines_frame(csv_path: str | None = None) -> pd.DataFrame:
    return load_recommender(csv_path)["frame"]


def normalized_query(value: str) -> str:
    return str(value or "").strip().lower()


def find_medicine_row(frame: pd.DataFrame, medicine_name: str) -> tuple[pd.Series | None, str | None]:
    query = normalized_query(medicine_name)
    if not query:
        return None, None

    exact_matches = frame[frame["Drug_Name"].str.lower() == query]
    if not exact_matches.empty:
        row = exact_matches.iloc[0]
        return row, row["Drug_Name"]

    partial_matches = frame[frame["Drug_Name"].str.contains(query, case=False, na=False)].copy()
    if not partial_matches.empty:
        partial_matches["rank"] = partial_matches["Drug_Name"].str.len().sub(len(query)).abs()
        row = partial_matches.sort_values(["rank", "Drug_Name"]).iloc[0]
        return row, row["Drug_Name"]

    fallback_names = frame["Drug_Name"].drop_duplicates().tolist()
    close_matches = get_close_matches(medicine_name, fallback_names, n=1, cutoff=0.6)
    if close_matches:
        row = frame[frame["Drug_Name"] == close_matches[0]].iloc[0]
        return row, row["Drug_Name"]

    return None, None


def medicine_detail(frame: pd.DataFrame, medicine_name: str) -> dict[str, Any] | None:
    row, matched_name = find_medicine_row(frame, medicine_name)
    if row is None:
        return None

    return {
        "name": matched_name,
        "reason": row["Reason"],
        "description": row["Description"],
        "side_effects": row["Side_Effects"],
    }


def recommend_alternatives(csv_path: str | None, medicine_name: str, limit: int = 6) -> dict[str, Any]:
    dataset = load_recommender(csv_path)
    frame = dataset["frame"]
    similarity_matrix = dataset["similarity_matrix"]

    row, matched_name = find_medicine_row(frame, medicine_name)
    if row is None:
        return {"matched_name": None, "results": []}

    index = row.name
    scores = list(enumerate(similarity_matrix[index]))
    scores.sort(key=lambda item: item[1], reverse=True)

    results = []
    for candidate_index, score in scores:
        if candidate_index == index or score <= 0:
            continue
        candidate = frame.iloc[candidate_index]
        results.append(
            {
                "name": candidate["Drug_Name"],
                "reason": candidate["Reason"],
                "description": candidate["Description"],
                "side_effects": candidate["Side_Effects"],
                "match_score": round(float(score) * 100, 1),
            }
        )
        if len(results) == limit:
            break

    return {"matched_name": matched_name, "results": results}


def all_medicine_names(csv_path: str | None = None) -> list[str]:
    frame = medicines_frame(csv_path)
    return sorted(frame["Drug_Name"].dropna().astype(str).unique().tolist(), key=str.lower)


def all_conditions(csv_path: str | None = None) -> list[str]:
    frame = medicines_frame(csv_path)
    return sorted(frame["Reason"].dropna().astype(str).unique().tolist(), key=str.lower)


def medicines_for_condition(condition: str, csv_path: str | None = None) -> list[dict[str, Any]]:
    frame = medicines_frame(csv_path)
    filtered = frame[frame["Reason"].str.lower() == normalized_query(condition)]
    return [
        {
            "name": row["Drug_Name"],
            "reason": row["Reason"],
            "description": row["Description"],
            "side_effects": row["Side_Effects"],
        }
        for _, row in filtered.sort_values("Drug_Name").iterrows()
    ]
