
const SupplierProduct = require("../models/SupplierProduct");

const {
    predictDelivery,
    predictDelay,
    explainDelivery
} = require("../services/aiService");


// ===============================
// DELIVERY PREDICTION
// ===============================
const deliveryPrediction = async (req, res) => {
    try {
        const result = await predictDelivery(req.body);

        res.json(result);

    } catch (error) {
        console.error(
            "Delivery prediction error:",
            error.message
        );

        res.status(500).json({
            message: "Failed to get delivery prediction"
        });
    }
};


// ===============================
// DELAY PREDICTION
// ===============================
const delayPrediction = async (req, res) => {
    try {
        const result = await predictDelay(req.body);

        res.json(result);

    } catch (error) {
        console.error(
            "Delay prediction error:",
            error.message
        );

        res.status(500).json({
            message: "Failed to get delay prediction"
        });
    }
};


// ===============================
// SUPPLIER COMPARISON
// ===============================
const compareSuppliers = async (req, res) => {
    try {
        const { productId } = req.params;

        // Find all suppliers selling this product
        const supplierProducts =
            await SupplierProduct.find({
                product: productId
            })
                .populate("supplier")
                .populate("product");


        // No suppliers found
        if (supplierProducts.length === 0) {
            return res.status(404).json({
                message:
                    "No suppliers found for this product"
            });
        }


        const results = [];


        // Get AI predictions for every supplier
        for (const item of supplierProducts) {

            const product = item.product;
            const supplier = item.supplier;


            // Delivery prediction
            const delivery = await predictDelivery({

                price: item.price,

                freight_value:
                    item.freightValue || 0,

                product_category_name:
                    product.category || "unknown",

                product_weight_g:
                    product.weight || 0,

                product_length_cm:
                    product.length || 0,

                product_height_cm:
                    product.height || 0,

                product_width_cm:
                    product.width || 0,

                product_photos_qty:
                    product.photosQuantity || 0
            });


            // Delay prediction
            const delay = await predictDelay({

                price: item.price,

                freight_value:
                    item.freightValue || 0
            });


            // Store supplier information
            results.push({

                supplier: supplier.name,

                supplierId: supplier._id,

                price: item.price,

                freightValue:
                    item.freightValue || 0,

                trustScore:
                    supplier.trustScore || 0,

                averageRating:
                    supplier.averageRating || 0,

                predictedDeliveryDays:
                    delivery.predicted_delivery_days,

                delayPrediction:
                    delay.delay_prediction,

                delayProbability:
                    delay.delay_probability
            });
        }


        // =====================================
        // CALCULATE RECOMMENDATION SCORE
        // =====================================

        const maximumPrice =
            Math.max(
                ...results.map(
                    supplier => supplier.price
                )
            );

        const maximumDeliveryDays =
            Math.max(
                ...results.map(
                    supplier =>
                        supplier.predictedDeliveryDays
                )
            );


        results.forEach((supplier) => {

            // Lower price = better score
            const priceScore =
                maximumPrice === 0
                    ? 100
                    : Math.max(
                        0,
                        100 -
                        (
                            supplier.price /
                            maximumPrice
                        ) * 100
                    );


            // Faster delivery = better score
            const deliveryScore =
                maximumDeliveryDays === 0
                    ? 100
                    : Math.max(
                        0,
                        100 -
                        (
                            supplier.predictedDeliveryDays /
                            maximumDeliveryDays
                        ) * 100
                    );


            // Lower delay probability = better score
            const delayScore =
                100 -
                (
                    supplier.delayProbability * 100
                );


            // Final recommendation score
            supplier.recommendationScore =
                Number(
                    (
                        supplier.trustScore * 0.40 +
                        priceScore * 0.20 +
                        deliveryScore * 0.20 +
                        delayScore * 0.20
                    ).toFixed(2)
                );
        });


        // =====================================
        // SORT SUPPLIERS
        // =====================================

        results.sort(
            (a, b) =>
                b.recommendationScore -
                a.recommendationScore
        );


        // =====================================
        // SEND RESPONSE
        // =====================================

        const recommendedSupplier = results.length > 0 ? results[0] : null; 
        res.json({ productId, recommendedSupplier, suppliers: results });
       


    } catch (error) {

        console.error(
            "Supplier comparison error:",
            error.message
        );

        res.status(500).json({
            message:
                "Failed to compare suppliers"
        });
    }
};


const deliveryExplanation = async (req, res) => {
    try {
        const result = await explainDelivery(req.body);

        res.json(result);

    } catch (error) {
        console.error(
            "SHAP explanation error:",
            error.message
        );

        res.status(500).json({
            message: "Failed to generate SHAP explanation"
        });
    }
};

// ===============================
// EXPORT CONTROLLERS
// ===============================

module.exports = {
    deliveryPrediction,
    delayPrediction,
    compareSuppliers,
    deliveryExplanation
};

