import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    classification_report,
    roc_auc_score
)


# Load dataset
df = pd.read_csv("data/delay_ml_dataset.csv")

print("Dataset loaded successfully!")
print("Rows:", len(df))


# Features
X = df[
    [
        "price",
        "freight_value"
    ]
]

# Target
y = df["delay"]


# Numerical features
numerical_features = [
    "price",
    "freight_value"
]


# Preprocessing
preprocessor = ColumnTransformer(
    transformers=[
        (
            "numerical",
            "passthrough",
            numerical_features
        )
    ]
)


# Classification model
model = RandomForestClassifier(
    n_estimators=100,
    random_state=42,
    n_jobs=-1,
    class_weight="balanced"
)


# Pipeline
pipeline = Pipeline(
    steps=[
        ("preprocessor", preprocessor),
        ("model", model)
    ]
)


# Train/test split
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)


print("\nTraining data:", len(X_train))
print("Testing data:", len(X_test))


# Train
print("\nTraining delay risk model...")

pipeline.fit(X_train, y_train)

print("Model training completed!")


# Predictions
y_pred = pipeline.predict(X_test)

# Probability of delay
y_probability = pipeline.predict_proba(X_test)[:, 1]


# Evaluation
print("\nClassification Report")
print("-----------------------")

print(
    classification_report(
        y_test,
        y_pred,
        target_names=["On Time", "Delayed"]
    )
)


# ROC-AUC
roc_auc = roc_auc_score(
    y_test,
    y_probability
)

print("ROC-AUC:", roc_auc)


# Save model
joblib.dump(
    pipeline,
    "models/delay_model.pkl"
)

print("\nDelay model saved successfully!")