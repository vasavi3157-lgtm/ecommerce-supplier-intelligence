const express = require("express");

const {
    deliveryPrediction,
    delayPrediction,
    compareSuppliers,
    deliveryExplanation
} = require("../controllers/aiController");

const router = express.Router();

router.post("/predict-delivery", deliveryPrediction);
router.post("/predict-delay", delayPrediction);
router.get("/compare-suppliers/:productId", compareSuppliers);
router.post("/explain-delivery", deliveryExplanation);

module.exports = router;