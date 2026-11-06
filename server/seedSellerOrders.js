require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const Supplier = require("./models/Supplier");
const Product = require("./models/Product");
const Order = require("./models/Order");

// CHANGE THIS to your seller's email before running
const SELLER_EMAIL = "PUT_SELLER_EMAIL_HERE";

const STATUSES = ["pending", "confirmed", "shipped", "delivered", "delivered", "delivered", "cancelled"];

const seedOrders = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected");

  const seller = await User.findOne({ email: SELLER_EMAIL, role: "supplier" });

  if (!seller || !seller.supplierId) {
    console.log("Seller not found or has no linked supplierId. Check the email and that the account registered as 'supplier'.");
    await mongoose.disconnect();
    return;
  }

  const supplier = await Supplier.findById(seller.supplierId);
  console.log(`Seeding orders for: ${supplier.name} (${seller.email})`);

  // Pick 20 random real products to attach to these fake orders
  const products = await Product.aggregate([{ $sample: { size: 20 } }]);

  // Need a customer to attach orders to — use any existing customer, or create one
  let customer = await User.findOne({ role: "customer" });
  if (!customer) {
    customer = await User.create({
      name: "Demo Customer",
      email: "demo.customer@example.com",
      password: "placeholder", // not used for login here
      role: "customer",
    });
  }

  const orders = [];

  for (let i = 0; i < 20; i++) {
    const product = products[i % products.length];
    const status = STATUSES[i % STATUSES.length];
    const price = product.price || 50;
    const daysAgo = Math.floor(Math.random() * 60);

    const purchaseDate = new Date();
    purchaseDate.setDate(purchaseDate.getDate() - daysAgo);

    const estimatedDeliveryDate = new Date(purchaseDate);
    estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 5);

    orders.push({
      orderId: `DEMO-${Date.now()}-${i}`,
      customer: customer._id,
      items: [
        {
          product: product._id,
          supplier: supplier._id,
          price: price,
          quantity: 1 + Math.floor(Math.random() * 3),
        },
      ],
      status,
      purchaseDate,
      estimatedDeliveryDate,
    });
  }

  await Order.insertMany(orders);
  console.log(`Inserted ${orders.length} demo orders for ${supplier.name}`);

  await mongoose.disconnect();
  console.log("Done");
};

seedOrders();