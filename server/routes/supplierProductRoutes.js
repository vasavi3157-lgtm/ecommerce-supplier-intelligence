const express = require("express");

const {
    addSupplierProduct,
    getSuppliersForProduct
} = require("../controllers/supplierProductController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    roleMiddleware("supplier", "admin"),
    addSupplierProduct
);

router.get(
    "/product/:productId",
    getSuppliersForProduct
);

module.exports = router;