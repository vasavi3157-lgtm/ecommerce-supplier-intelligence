const SupplierProduct = require("../models/SupplierProduct");

const addSupplierProduct = async (req, res) => {
    try {
        const {
            supplier,
            product,
            price,
            freightValue
        } = req.body;

        if (!supplier || !product || price === undefined) {
            return res.status(400).json({
                message: "Please provide supplier, product and price"
            });
        }

        const existing = await SupplierProduct.findOne({
            supplier,
            product
        });

        if (existing) {
            return res.status(400).json({
                message: "This supplier already sells this product"
            });
        }

        const supplierProduct = await SupplierProduct.create({
            supplier,
            product,
            price,
            freightValue
        });

        res.status(201).json({
            message: "Product linked to supplier successfully",
            supplierProduct
        });

    } catch (error) {
        console.error("Supplier product error:", error.message);

        res.status(500).json({
            message: "Server error"
        });
    }
};


const getSuppliersForProduct = async (req, res) => {
    try {
        const { productId } = req.params;

        const suppliers = await SupplierProduct.find({
            product: productId
        })
            .populate("supplier")
            .populate("product");

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


module.exports = {
    addSupplierProduct,
    getSuppliersForProduct
};