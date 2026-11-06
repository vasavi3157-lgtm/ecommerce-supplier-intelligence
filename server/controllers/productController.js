const Product = require("../models/Product");

// Create product
const createProduct = async (req, res) => {
    try {
        const {
            productId,
            name,
            category,
            description,
            price,
            weight,
            length,
            height,
            width,
            photosQuantity
        } = req.body;

        if (!productId || !name || !category || price === undefined) {
            return res.status(400).json({
                message: "Please provide productId, name, category and price"
            });
        }

        const existingProduct = await Product.findOne({ productId });

        if (existingProduct) {
            return res.status(400).json({
                message: "Product already exists"
            });
        }

        const product = await Product.create({
            productId,
            name,
            category,
            description,
            price,
            weight,
            length,
            height,
            width,
            photosQuantity
        });

        res.status(201).json({
            message: "Product created successfully",
            product
        });

    } catch (error) {
        console.error("Create product error:", error.message);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// Get a random set of 50 products (used on the Home page for variety)
const getProducts = async (req, res) => {
    try {
        const products = await Product.aggregate([
            { $sample: { size: 2000 } },
            {
                $group: {
                    _id: "$category",
                    product: { $first: "$$ROOT" }
                }
            },
            { $replaceRoot: { newRoot: "$product" } },
            { $limit: 50 }
        ]);

        res.status(200).json({
            count: products.length,
            products
        });

    } catch (error) {
        console.error("Get products error:", error.message);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// Get ONE product by its real database _id
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json({ product });

    } catch (error) {
        console.error("Get product by id error:", error.message);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// Browse products with search, category filter, price range, sort, pagination
// Used by the Product Listing page
const browseProducts = async (req, res) => {
    try {
        const {
            search,
            category,
            minPrice,
            maxPrice,
            sort,
            page = 1,
            limit = 24
        } = req.query;

        const filter = {};

        if (category) {
            filter.category = category;
        }

        if (search) {
            filter.$or = [
                { category: { $regex: search, $options: "i" } },
                { productId: { $regex: search, $options: "i" } }
            ];
        }

        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }

        let sortOption = { _id: 1 };
        if (sort === "price_asc") sortOption = { price: 1 };
        else if (sort === "price_desc") sortOption = { price: -1 };
        else if (sort === "newest") sortOption = { createdAt: -1 };

        const pageNum = Math.max(1, Number(page));
        const limitNum = Math.min(60, Number(limit) || 24);
        const skip = (pageNum - 1) * limitNum;

        const [products, total] = await Promise.all([
            Product.find(filter).sort(sortOption).skip(skip).limit(limitNum),
            Product.countDocuments(filter)
        ]);

        res.status(200).json({
            products,
            total,
            page: pageNum,
            pages: Math.ceil(total / limitNum) || 1
        });

    } catch (error) {
        console.error("Browse products error:", error.message);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// Get all distinct categories with product counts (used for sidebar filters)
const getCategories = async (req, res) => {
    try {
        const categories = await Product.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        res.status(200).json({ categories });

    } catch (error) {
        console.error("Get categories error:", error.message);

        res.status(500).json({
            message: "Server error"
        });
    }
};


module.exports = {
    createProduct,
    getProducts,
    getProductById,
    browseProducts,
    getCategories
};