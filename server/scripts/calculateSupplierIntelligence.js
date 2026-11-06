
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const mongoose = require("mongoose");
require("dotenv").config();

const Supplier = require("../models/Supplier");


// ==========================================
// CSV READER
// ==========================================

const readCSV = (filePath) => {
    return new Promise((resolve, reject) => {

        const results = [];

        fs.createReadStream(filePath)
            .pipe(csv())
            .on("data", (row) => {
                results.push(row);
            })
            .on("end", () => {
                resolve(results);
            })
            .on("error", reject);
    });
};


// ==========================================
// MAIN FUNCTION
// ==========================================

const calculateSupplierIntelligence = async () => {

    try {

        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected");


        const dataPath = path.join(
            __dirname,
            "../../ai/data"
        );


        // ==========================================
        // READ DATASETS
        // ==========================================

        console.log("Reading orders...");

        const orders = await readCSV(
            path.join(
                dataPath,
                "olist_orders_dataset.csv"
            )
        );

        console.log(
            `Orders loaded: ${orders.length}`
        );


        console.log("Reading order items...");

        const orderItems = await readCSV(
            path.join(
                dataPath,
                "olist_order_items_dataset.csv"
            )
        );

        console.log(
            `Order items loaded: ${orderItems.length}`
        );


        console.log("Reading reviews...");

        const reviews = await readCSV(
            path.join(
                dataPath,
                "olist_order_reviews_dataset.csv"
            )
        );

        console.log(
            `Reviews loaded: ${reviews.length}`
        );


        // ==========================================
        // ORDER → SUPPLIER MAPPING
        // ==========================================

        const orderSuppliers = new Map();


        for (const item of orderItems) {

            if (!orderSuppliers.has(item.order_id)) {

                orderSuppliers.set(
                    item.order_id,
                    new Set()
                );
            }

            orderSuppliers
                .get(item.order_id)
                .add(item.seller_id);
        }


        // ==========================================
        // REVIEW MAPPING
        // ==========================================

        const orderRatings = new Map();


        for (const review of reviews) {

            const rating =
                Number(review.review_score);

            if (
                review.order_id &&
                !Number.isNaN(rating)
            ) {
                orderRatings.set(
                    review.order_id,
                    rating
                );
            }
        }


        // ==========================================
        // SUPPLIER METRICS
        // ==========================================

        const supplierMetrics = new Map();


        const getSupplier = (sellerId) => {

            if (!supplierMetrics.has(sellerId)) {

                supplierMetrics.set(
                    sellerId,
                    {
                        totalOrders: 0,
                        deliveredOrders: 0,
                        onTimeOrders: 0,
                        reviewTotal: 0,
                        reviewCount: 0
                    }
                );
            }

            return supplierMetrics.get(sellerId);
        };


        // ==========================================
        // PROCESS ORDERS
        // ==========================================

        for (const order of orders) {

            const sellers =
                orderSuppliers.get(order.order_id);

            if (!sellers) {
                continue;
            }


            for (const sellerId of sellers) {

                const metrics =
                    getSupplier(sellerId);


                metrics.totalOrders++;


                // Only delivered orders are used
                // for delivery performance
                if (
                    order.order_status ===
                    "delivered"
                ) {

                    metrics.deliveredOrders++;


                    if (
                        order.order_delivered_customer_date &&
                        order.order_estimated_delivery_date
                    ) {

                        const actualDate =
                            new Date(
                                order.order_delivered_customer_date
                            );

                        const estimatedDate =
                            new Date(
                                order.order_estimated_delivery_date
                            );


                        if (
                            actualDate <= estimatedDate
                        ) {
                            metrics.onTimeOrders++;
                        }
                    }
                }


                // Review score
                if (
                    orderRatings.has(
                        order.order_id
                    )
                ) {

                    metrics.reviewTotal +=
                        orderRatings.get(
                            order.order_id
                        );

                    metrics.reviewCount++;
                }
            }
        }


        // ==========================================
        // PREPARE BULK UPDATES
        // ==========================================

        const operations = [];


        for (
            const [sellerId, metrics]
            of supplierMetrics
        ) {

            const onTimeDeliveryRate =
                metrics.deliveredOrders > 0
                    ? (
                        metrics.onTimeOrders /
                        metrics.deliveredOrders
                    ) * 100
                    : 0;


            const averageRating =
                metrics.reviewCount > 0
                    ? (
                        metrics.reviewTotal /
                        metrics.reviewCount
                    )
                    : 0;


            const ratingScore =
                (averageRating / 5) * 100;


            const orderVolumeScore =
                Math.min(
                    (
                        metrics.totalOrders /
                        100
                    ) * 100,
                    100
                );


            // ==========================================
            // TRUST SCORE
            // ==========================================

            const trustScore =
                (
                    onTimeDeliveryRate * 0.50 +
                    ratingScore * 0.30 +
                    orderVolumeScore * 0.20
                );


            operations.push({

                updateOne: {

                    filter: {
                        supplierId: sellerId
                    },

                    update: {

                        $set: {

                            totalOrders:
                                metrics.totalOrders,

                            averageRating:
                                Number(
                                    averageRating.toFixed(2)
                                ),

                            onTimeDeliveryRate:
                                Number(
                                    onTimeDeliveryRate.toFixed(2)
                                ),

                            trustScore:
                                Number(
                                    trustScore.toFixed(2)
                                )
                        }
                    }
                }
            });
        }


        // ==========================================
        // BULK DATABASE UPDATE
        // ==========================================

        console.log(
            `Updating ${operations.length} suppliers...`
        );


        if (operations.length > 0) {

            const result =
                await Supplier.bulkWrite(
                    operations
                );

            console.log(
                `Suppliers updated: ${result.modifiedCount}`
            );
        }


        console.log("");
        console.log(
            "======================================"
        );
        console.log(
            "Supplier intelligence calculation complete"
        );
        console.log(
            `Suppliers processed: ${operations.length}`
        );
        console.log(
            "======================================"
        );


    } catch (error) {

        console.error(
            "Supplier intelligence error:",
            error.message
        );

    } finally {

        await mongoose.disconnect();

        console.log(
            "MongoDB connection closed"
        );
    }
};


// ==========================================
// RUN
// ==========================================

calculateSupplierIntelligence();

