const express = require("express");

const {
    createOrder,
    getMyOrders,
    getSellerOrders,
    getSellerStats,
    updateOrderStatus
} = require("../controllers/orderController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    roleMiddleware("customer"),
    createOrder
);

router.get(
    "/my-orders",
    authMiddleware,
    roleMiddleware("customer"),
    getMyOrders
);

router.get(
    "/seller-orders",
    authMiddleware,
    roleMiddleware("supplier", "admin"),
    getSellerOrders
);

router.get(
    "/seller-stats",
    authMiddleware,
    roleMiddleware("supplier", "admin"),
    getSellerStats
);

router.patch(
    "/:id/status",
    authMiddleware,
    roleMiddleware("supplier", "admin"),
    updateOrderStatus
);

module.exports = router;