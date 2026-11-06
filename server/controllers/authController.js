const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Supplier = require("../models/Supplier");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Please provide name, email and password"
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const finalRole = role || "customer";

        let supplierId = null;

        // If registering as a seller, link to a real Supplier record
        // from the imported Olist data, so the trust score, orders,
        // and performance metrics are genuine, not fabricated.
        if (finalRole === "supplier") {
            const unlinkedSupplier = await Supplier.findOne({ linkedUser: null });

            if (unlinkedSupplier) {
                supplierId = unlinkedSupplier._id;
            }
        }

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: finalRole,
            supplierId
        });

        // Mark the claimed Supplier record as linked, so it can't be
        // claimed by another seller account
        if (supplierId) {
            await Supplier.findByIdAndUpdate(supplierId, { linkedUser: user._id });
        }

        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                supplierId: user.supplierId
            }
        });

    } catch (error) {
        console.error("Registration error:", error.message);

        res.status(500).json({
            message: "Server error"
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Please provide email and password"
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role, supplierId: user.supplierId },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                supplierId: user.supplierId
            }
        });

    } catch (error) {
        console.error("Login error:", error.message);

        res.status(500).json({
            message: "Server error"
        });
    }
};

module.exports = { registerUser, loginUser };