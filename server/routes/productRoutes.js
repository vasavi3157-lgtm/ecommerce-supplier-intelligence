const express = require("express");

const {
    createProduct,
    getProducts,
    getProductById,
    browseProducts,
    getCategories
} = require("../controllers/productController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    roleMiddleware("supplier", "admin"),
    createProduct
);

// These two must come BEFORE "/:id", otherwise Express treats
// "browse" and "categories" as an :id value and the route never matches.
router.get("/browse", browseProducts);
router.get("/categories", getCategories);

router.get("/", getProducts);
router.get("/:id", getProductById);

module.exports = router;