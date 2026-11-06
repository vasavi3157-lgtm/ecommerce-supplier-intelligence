
import joblib
import pandas as pd
import shap


# Load trained delivery model
pipeline = joblib.load("models/delivery_model.pkl")

# Get preprocessor and model
preprocessor = pipeline.named_steps["preprocessor"]
model = pipeline.named_steps["model"]


# Create SHAP explainer
explainer = shap.TreeExplainer(model)


def explain_delivery(data):
    """
    Generate SHAP explanation for one delivery prediction.
    """

    input_data = pd.DataFrame([{
        "price": data["price"],
        "freight_value": data["freight_value"],
        "product_category_name":
            data["product_category_name"],
        "product_weight_g":
            data["product_weight_g"],
        "product_length_cm":
            data["product_length_cm"],
        "product_height_cm":
            data["product_height_cm"],
        "product_width_cm":
            data["product_width_cm"],
        "product_photos_qty":
            data["product_photos_qty"]
    }])


    # Transform input using the same preprocessing
    transformed_data = preprocessor.transform(input_data)

    # Convert sparse matrix to dense
    if hasattr(transformed_data, "toarray"):
        transformed_data = transformed_data.toarray()

    transformed_data = transformed_data.astype(float)


    # Calculate SHAP values
    shap_values = explainer.shap_values(
        transformed_data
    )


    # Get feature names
    feature_names = (
        preprocessor.get_feature_names_out()
    )


    # Convert SHAP values to list
    shap_values_list = shap_values[0].tolist()


    # Create feature explanations
    explanations = []

    for feature, value in zip(
        feature_names,
        shap_values_list
    ):

        explanations.append({
            "feature": feature,
            "shap_value": round(
                float(value),
                4
            )
        })


    # Sort by absolute SHAP impact
    explanations.sort(
        key=lambda x:
            abs(x["shap_value"]),
        reverse=True
    )


    return explanations[:10]

