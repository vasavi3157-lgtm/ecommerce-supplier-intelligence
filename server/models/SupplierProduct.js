const mongoose = require("mongoose");

const supplierProductSchema = new mongoose.Schema(
    {
        supplier: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Supplier",
            required: true
        },

        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
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
        timestamps: true
    }
);

supplierProductSchema.index(
    { supplier: 1, product: 1 },
    { unique: true }
);

module.exports = mongoose.model(
    "SupplierProduct",
    supplierProductSchema
);