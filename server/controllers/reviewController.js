const Review = require("../models/Review");

const createReview = async (req, res) => {
    try {
        const {
            reviewId,
            order,
            rating,
            title,
            comment
        } = req.body;

        if (!reviewId || !order || !rating) {
            return res.status(400).json({
                message: "Please provide reviewId, order and rating"
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                message: "Rating must be between 1 and 5"
            });
        }

        const existingReview = await Review.findOne({ reviewId });

        if (existingReview) {
            return res.status(400).json({
                message: "Review already exists"
            });
        }

        const review = await Review.create({
            reviewId,
            order,
            customer: req.user.id,
            rating,
            title,
            comment
        });

        res.status(201).json({
            message: "Review created successfully",
            review
        });

    } catch (error) {
        console.error("Create review error:", error.message);

        res.status(500).json({
            message: "Server error"
        });
    }
};


const getReviews = async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate("customer", "name email")
            .populate("order", "orderId status");

        res.status(200).json({
            count: reviews.length,
            reviews
        });

    } catch (error) {
        console.error("Get reviews error:", error.message);

        res.status(500).json({
            message: "Server error"
        });
    }
};


module.exports = {
    createReview,
    getReviews
};