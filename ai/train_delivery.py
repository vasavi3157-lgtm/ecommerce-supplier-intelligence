import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.ensemble import RandomForestRegressor
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


# Load dataset
df = pd.read_csv("data/delivery_ml_dataset.csv")

print("Dataset loaded successfully!")
print("Rows:", len(df))


# Features
X = df[
    [
        "price",
        "freight_value",
        "product_category_name",
        "product_weight_g",
        "product_length_cm",
        "product_height_cm",
        "product_width_cm",
        "product_photos_qty"
    ]
]

# Target
y = df["delivery_time_days"]


# Categorical and numerical columns
categorical_features = [
    "product_category_name"
]

numerical_features = [
    "price",
    "freight_value",
    "product_weight_g",
    "product_length_cm",
    "product_height_cm",
    "product_width_cm",
    "product_photos_qty"
]


# Preprocessing
preprocessor = ColumnTransformer(
    transformers=[
        (
            "categorical",
            OneHotEncoder(handle_unknown="ignore"),
            categorical_features
        ),
        (
            "numerical",
            "passthrough",
            numerical_features
        )
    ]
)


# Model
model = RandomForestRegressor(
    n_estimators=100,
    random_state=42,
    n_jobs=-1
)


# Complete pipeline
pipeline = Pipeline(
    steps=[
        ("preprocessor", preprocessor),
        ("model", model)
    ]
)


# Split data into training and testing
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)


print("\nTraining data:", len(X_train))
print("Testing data:", len(X_test))


# Train model
print("\nTraining model...")

pipeline.fit(X_train, y_train)

print("Model training completed!")


# Predictions
y_pred = pipeline.predict(X_test)


# Evaluation
mae = mean_absolute_error(y_test, y_pred)

rmse = mean_squared_error(
    y_test,
    y_pred
) ** 0.5

r2 = r2_score(y_test, y_pred)


print("\nModel Performance")
print("-----------------------")
print("MAE :", mae)
print("RMSE:", rmse)
print("R²  :", r2)
# Save trained model
joblib.dump(
    pipeline,
    "models/delivery_model.pkl"
)

print("\nDelivery model saved successfully!")