const Supplier = require("../models/Supplier");

// Create supplier
const createSupplier = async (req, res) => {
    try {
        const {
            supplierId,
            name,
            city,
            state,
            zipCode
        } = req.body;

        if (!supplierId || !name) {
            return res.status(400).json({
                message: "Please provide supplierId and name"
            });
        }

        const existingSupplier = await Supplier.findOne({ supplierId });

        if (existingSupplier) {
            return res.status(400).json({
                message: "Supplier already exists"
            });
        }

        const supplier = await Supplier.create({
            supplierId,
            name,
            city,
            state,
            zipCode
        });

        res.status(201).json({
            message: "Supplier created successfully",
            supplier
        });

    } catch (error) {
        console.error("Create supplier error:", error.message);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// Get suppliers - limited to 100 for table display
const getSuppliers = async (req, res) => {
    try {
        const suppliers = await Supplier.find().limit(100);

        res.status(200).json({
            count: suppliers.length,
            suppliers
        });

    } catch (error) {
        console.error("Get suppliers error:", error.message);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// Get dashboard summary stats - calculated on the backend (fast)
const getSupplierStats = async (req, res) => {
    try {
        const totalSuppliers = await Supplier.countDocuments();

        const avgResult = await Supplier.aggregate([
            { $group: { _id: null, avgTrust: { $avg: "$trustScore" } } }
        ]);
        const averageReliability = avgResult.length > 0
            ? Math.round(avgResult[0].avgTrust)
            : 0;

        const highRiskCount = await Supplier.countDocuments({
            trustScore: { $lt: 50 }
        });

        const topSuppliers = await Supplier.find()
            .sort({ trustScore: -1 })
            .limit(10)
            .select("name trustScore");

        res.status(200).json({
            totalSuppliers,
            averageReliability,
            highRiskCount,
            topSuppliers
        });

    } catch (error) {
        console.error("Get supplier stats error:", error.message);

        res.status(500).json({
            message: "Server error"
        });
    }
};


module.exports = {
    createSupplier,
    getSuppliers,
    getSupplierStats
};