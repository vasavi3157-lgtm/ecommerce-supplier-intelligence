const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },

        supplier: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Supplier",
            required: true
        },

        price: {
            type: Number,
            required: true
        },

        freightValue: {
            type: Number,
            default: 0
        }
    },
    {
        _id: false
    }
);

const orderSchema = new mongoose.Schema(
    {
        orderId: {
            type: String,
            required: true,
            unique: true
        },

        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        items: {
            type: [orderItemSchema],
            required: true
        },

        status: {
            type: String,
            default: "pending"
        },

        purchaseDate: {
            type: Date
        },

        approvedDate: {
            type: Date
        },

        deliveredCarrierDate: {
            type: Date
        },

        deliveredCustomerDate: {
            type: Date
        },

        estimatedDeliveryDate: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Order", orderSchema);