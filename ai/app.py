from flask import Flask, request, jsonify
import joblib
import pandas as pd

# The delivery pipeline is loaded once inside explain.py and reused here
from explain import explain_delivery, pipeline as delivery_model

app = Flask(__name__)

# Delay model (the delivery model is already loaded in explain.py)
delay_model = joblib.load("models/delay_model.pkl")


@app.route("/")
def home():
    return jsonify({
        "message": "AI Service is running!"
    })


@app.route("/predict-delivery", methods=["POST"])
def predict_delivery():
    try:
        data = request.json

        input_data = pd.DataFrame([{
            "price": data["price"],
            "freight_value": data["freight_value"],
            "product_category_name": data["product_category_name"],
            "product_weight_g": data["product_weight_g"],
            "product_length_cm": data["product_length_cm"],
            "product_height_cm": data["product_height_cm"],
            "product_width_cm": data["product_width_cm"],
            "product_photos_qty": data["product_photos_qty"]
        }])

        prediction = delivery_model.predict(input_data)

        return jsonify({
            "predicted_delivery_days": round(float(prediction[0]), 2)
        })

    except KeyError as error:
        return jsonify({
            "message": f"Missing field: {error}"
        }), 400

    except Exception as error:
        print("Delivery prediction error:", str(error))
        return jsonify({
            "message": "Failed to predict delivery"
        }), 500


@app.route("/predict-delay", methods=["POST"])
def predict_delay():
    try:
        data = request.json

        input_data = pd.DataFrame([{
            "price": data["price"],
            "freight_value": data["freight_value"]
        }])

        prediction = delay_model.predict(input_data)
        probability = delay_model.predict_proba(input_data)[0][1]

        return jsonify({
            "delay_prediction": int(prediction[0]),
            "delay_probability": round(float(probability), 2)
        })

    except KeyError as error:
        return jsonify({
            "message": f"Missing field: {error}"
        }), 400

    except Exception as error:
        print("Delay prediction error:", str(error))
        return jsonify({
            "message": "Failed to predict delay"
        }), 500


@app.route("/explain-delivery", methods=["POST"])
def explain_delivery_prediction():
    try:
        data = request.json

        explanations = explain_delivery(data)

        return jsonify({
            "explanations": explanations
        })

    except KeyError as error:
        return jsonify({
            "message": f"Missing field: {error}"
        }), 400

    except Exception as error:
        print("SHAP explanation error:", str(error))
        return jsonify({
            "message": "Failed to generate SHAP explanation"
        }), 500


if __name__ == "__main__":
    # debug=False stops Flask from starting a second copy that would
    # load the models twice and use double the memory
    app.run(port=8000, debug=False)
    