const Order = require("../models/Order");
const Supplier = require("../models/Supplier");

const createOrder = async (req, res) => {
    try {
        const {
            orderId,
            items,
            purchaseDate,
            estimatedDeliveryDate
        } = req.body;

        if (!orderId || !items || items.length === 0) {
            return res.status(400).json({
                message: "Please provide orderId and items"
            });
        }

        const existingOrder = await Order.findOne({ orderId });

        if (existingOrder) {
            return res.status(400).json({
                message: "Order already exists"
            });
        }

        const order = await Order.create({
            orderId,
            customer: req.user.id,
            items,
            status: "pending",
            purchaseDate,
            estimatedDeliveryDate
        });

        res.status(201).json({
            message: "Order created successfully",
            order
        });

    } catch (error) {
        console.error("Create order error:", error.message);

        res.status(500).json({
            message: "Server error"
        });
    }
};


const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            customer: req.user.id
        })
            .populate("items.product")
            .populate("items.supplier");

        res.status(200).json({
            count: orders.length,
            orders
        });

    } catch (error) {
        console.error("Get orders error:", error.message);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// Get orders where the logged-in seller is the supplier on at least one item
const getSellerOrders = async (req, res) => {
    try {
        const supplierId = req.user.supplierId;

        if (!supplierId) {
            return res.status(400).json({
                message: "No supplier profile linked to this account"
            });
        }

        const orders = await Order.find({
            "items.supplier": supplierId
        })
            .populate("items.product")
            .populate("customer", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            count: orders.length,
            orders
        });

    } catch (error) {
        console.error("Get seller orders error:", error.message);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// Get summary stats + performance info for the logged-in seller
const getSellerStats = async (req, res) => {
    try {
        const supplierId = req.user.supplierId;

        if (!supplierId) {
            return res.status(400).json({
                message: "No supplier profile linked to this account"
            });
        }

        const supplier = await Supplier.findById(supplierId);

        if (!supplier) {
            return res.status(404).json({
                message: "Supplier profile not found"
            });
        }

        const orders = await Order.find({ "items.supplier": supplierId });

        let revenue = 0;
        let pending = 0;
        let confirmed = 0;
        let shipped = 0;
        let delivered = 0;
        let cancelled = 0;

        orders.forEach((order) => {
            order.items.forEach((item) => {
                if (String(item.supplier) === String(supplierId)) {
                    revenue += (item.price || 0) * (item.quantity || 1);
                }
            });

            if (order.status === "pending") pending++;
            else if (order.status === "confirmed") confirmed++;
            else if (order.status === "shipped") shipped++;
            else if (order.status === "delivered") delivered++;
            else if (order.status === "cancelled") cancelled++;
        });

        // Risk level derived from the real trust score
        let riskLevel = "Low";
        if (supplier.trustScore < 50) riskLevel = "High";
        else if (supplier.trustScore < 75) riskLevel = "Medium";

        // Explainable reasons based on real supplier metrics
        const reasons = [];
        if (supplier.onTimeDeliveryRate >= 90) {
            reasons.push("Strong on-time delivery performance.");
        } else if (supplier.onTimeDeliveryRate < 70) {
            reasons.push("On-time delivery rate is below target.");
        }
        if (supplier.averageRating >= 4) {
            reasons.push("Consistently positive customer reviews.");
        } else if (supplier.averageRating > 0 && supplier.averageRating < 3) {
            reasons.push("Customer ratings are lower than average.");
        }
        if (supplier.totalOrders >= 50) {
            reasons.push("High order volume reflects strong demand.");
        }
        if (reasons.length === 0) {
            reasons.push("Performance is based on limited historical order data.");
        }

        // Recommended actions based on weak areas
        const actions = [];
        if (supplier.onTimeDeliveryRate < 90) {
            actions.push("Improve delivery time to boost your reliability ranking.");
        }
        if (supplier.averageRating < 4 && supplier.averageRating > 0) {
            actions.push("Focus on product quality and packaging to raise customer ratings.");
        }
        if (cancelled > 0) {
            actions.push("Reduce order cancellations to improve trust score.");
        }
        if (actions.length === 0) {
            actions.push("Maintain your current performance standards.");
        }

        res.status(200).json({
            sellerName: supplier.name,
            totalOrders: orders.length,
            revenue: Number(revenue.toFixed(2)),
            onTimeDeliveryRate: supplier.onTimeDeliveryRate,
            averageRating: supplier.averageRating,
            trustScore: supplier.trustScore,
            riskLevel,
            reasons,
            actions,
            statusBreakdown: { pending, confirmed, shipped, delivered, cancelled }
        });

    } catch (error) {
        console.error("Get seller stats error:", error.message);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// Seller updates the status of an order
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid status value"
            });
        }

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        const supplierId = req.user.supplierId;
        const isSellerOnOrder = order.items.some(
            (item) => String(item.supplier) === String(supplierId)
        );

        if (!isSellerOnOrder) {
            return res.status(403).json({
                message: "You are not authorized to update this order"
            });
        }

        order.status = status;
        await order.save();

        res.status(200).json({
            message: "Order status updated",
            order
        });

    } catch (error) {
        console.error("Update order status error:", error.message);

        res.status(500).json({
            message: "Server error"
        });
    }
};


module.exports = {
    createOrder,
    getMyOrders,
    getSellerOrders,
    getSellerStats,
    updateOrderStatus
};