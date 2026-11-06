const express = require("express");

const {
    createSupplier,
    getSuppliers,
    getSupplierStats
} = require("../controllers/supplierController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    roleMiddleware("supplier", "admin"),
    createSupplier
);

router.get("/stats", getSupplierStats);
router.get("/", getSuppliers);

module.exports = router;