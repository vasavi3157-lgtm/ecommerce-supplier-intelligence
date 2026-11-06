const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema(
    {
        supplierId: {
            type: String,
            required: true,
            unique: true
        },

        name: {
            type: String,
            required: true,
            trim: true
        },

        city: {
            type: String,
            default: ""
        },

        state: {
            type: String,
            default: ""
        },

        zipCode: {
            type: String,
            default: ""
        },

        trustScore: {
            type: Number,
            default: 0
        },

        averageRating: {
            type: Number,
            default: 0
        },

        totalOrders: {
            type: Number,
            default: 0
        },

        onTimeDeliveryRate: {
            type: Number,
            default: 0
        },

        // Links this Supplier record to the User account (role: "supplier")
        // who claimed it on registration. null = still available to claim.
        linkedUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Supplier", supplierSchema);