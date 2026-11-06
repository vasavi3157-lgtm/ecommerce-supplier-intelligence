
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const mongoose = require("mongoose");

require("dotenv").config();

const Product = require("../models/Product");
const Supplier = require("../models/Supplier");
const SupplierProduct = require("../models/SupplierProduct");


// ==========================================
// READ CSV FILE
// ==========================================

const readCSV = (filePath) => {
    return new Promise((resolve, reject) => {

        const results = [];

        fs.createReadStream(filePath)
            .pipe(csv())
            .on("data", (row) => {
                results.push(row);
            })
            .on("end", () => {
                resolve(results);
            })
            .on("error", reject);
    });
};


// ==========================================
// MAIN IMPORT FUNCTION
// ==========================================

const importOlistData = async () => {

    try {

        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected");


        const dataPath = path.join(
            __dirname,
            "../../ai/data"
        );


        // ==========================================
        // READ DATASETS
        // ==========================================

        const products = await readCSV(
            path.join(
                dataPath,
                "olist_products_dataset.csv"
            )
        );

        const sellers = await readCSV(
            path.join(
                dataPath,
                "olist_sellers_dataset.csv"
            )
        );

        const orderItems = await readCSV(
            path.join(
                dataPath,
                "olist_order_items_dataset.csv"
            )
        );


        console.log(
            `Products found: ${products.length}`
        );

        console.log(
            `Sellers found: ${sellers.length}`
        );

        console.log(
            `Order items found: ${orderItems.length}`
        );


        // ==========================================
        // CALCULATE PRODUCT PRICES
        // ==========================================

        const productPriceData = new Map();


        for (const item of orderItems) {

            const productId =
                String(item.product_id || "").trim();

            const price =
                Number(item.price);


            if (
                !productId ||
                Number.isNaN(price)
            ) {
                continue;
            }


            if (!productPriceData.has(productId)) {

                productPriceData.set(
                    productId,
                    {
                        total: 0,
                        count: 0
                    }
                );
            }


            const data =
                productPriceData.get(productId);

            data.total += price;
            data.count++;
        }


        // ==========================================
        // CLEAR OLD DATA
        // ==========================================

        await SupplierProduct.deleteMany({});
        await Product.deleteMany({});
        await Supplier.deleteMany({});


        // ==========================================
        // PREPARE PRODUCTS
        // ==========================================

        const productDocuments = products.map(
            (product) => {

                const productId =
                    String(
                        product.product_id || ""
                    ).trim();


                const priceData =
                    productPriceData.get(
                        productId
                    );


                const averagePrice =
                    priceData &&
                    priceData.count > 0
                        ? priceData.total /
                          priceData.count
                        : 0;


                return {

                    productId: productId,

                    name:
                        product.product_category_name ||
                        "Unknown Product",

                    category:
                        product.product_category_name ||
                        "unknown",

                    description: "",

                    price:
                        Number(
                            averagePrice.toFixed(2)
                        ),

                    weight:
                        Number(
                            product.product_weight_g
                        ) || 0,

                    length:
                        Number(
                            product.product_length_cm
                        ) || 0,

                    height:
                        Number(
                            product.product_height_cm
                        ) || 0,

                    width:
                        Number(
                            product.product_width_cm
                        ) || 0,

                    photosQuantity:
                        Number(
                            product.product_photos_qty
                        ) || 0
                };
            }
        );


        // ==========================================
        // INSERT PRODUCTS
        // ==========================================

        const insertedProducts =
            await Product.insertMany(
                productDocuments
            );


        console.log(
            `Products imported: ${insertedProducts.length}`
        );


        // ==========================================
        // PREPARE SUPPLIERS
        // ==========================================

        const supplierDocuments = sellers.map(
            (seller) => ({

                supplierId:
                    String(
                        seller.seller_id || ""
                    ).trim(),

                name:
                    `Supplier ${
                        String(
                            seller.seller_id || ""
                        ).trim()
                    }`,

                city:
                    seller.seller_city || "",

                state:
                    seller.seller_state || "",

                zipCode:
                    seller.seller_zip_code_prefix || "",

                trustScore: 0,

                averageRating: 0,

                totalOrders: 0,

                onTimeDeliveryRate: 0
            })
        );


        // ==========================================
        // INSERT SUPPLIERS
        // ==========================================

        const insertedSuppliers =
            await Supplier.insertMany(
                supplierDocuments
            );


        console.log(
            `Suppliers imported: ${insertedSuppliers.length}`
        );


        // ==========================================
        // CREATE PRODUCT LOOKUP MAP
        // ==========================================

        const productMap = new Map();


        for (
            const product of insertedProducts
        ) {

            productMap.set(
                String(
                    product.productId
                ).trim(),

                product._id
            );
        }


        // ==========================================
        // CREATE SUPPLIER LOOKUP MAP
        // ==========================================

        const supplierMap = new Map();


        for (
            const supplier of insertedSuppliers
        ) {

            supplierMap.set(
                String(
                    supplier.supplierId
                ).trim(),

                supplier._id
            );
        }


        console.log(
            `Product map: ${productMap.size}`
        );

        console.log(
            `Supplier map: ${supplierMap.size}`
        );


        // ==========================================
        // CREATE UNIQUE SUPPLIER-PRODUCT RELATIONSHIPS
        // ==========================================

        const relationshipMap = new Map();


        for (const item of orderItems) {

            const productId =
                String(
                    item.product_id || ""
                ).trim();

            const sellerId =
                String(
                    item.seller_id || ""
                ).trim();


            const productObjectId =
                productMap.get(
                    productId
                );

            const supplierObjectId =
                supplierMap.get(
                    sellerId
                );


            // Ignore invalid relationships
            if (
                !productObjectId ||
                !supplierObjectId
            ) {
                continue;
            }


            const key =
                `${sellerId}_${productId}`;


            // One relationship per
            // supplier-product pair
            if (
                !relationshipMap.has(key)
            ) {

                relationshipMap.set(
                    key,
                    {

                        supplier:
                            supplierObjectId,

                        product:
                            productObjectId,

                        price:
                            Number(
                                item.price
                            ) || 0,

                        freightValue:
                            Number(
                                item.freight_value
                            ) || 0
                    }
                );
            }
        }


        const relationships =
            Array.from(
                relationshipMap.values()
            );


        console.log(
            `Unique relationships prepared: ${relationships.length}`
        );


        // ==========================================
        // INSERT RELATIONSHIPS
        // ==========================================

        if (
            relationships.length > 0
        ) {

            await SupplierProduct.insertMany(
                relationships,
                {
                    ordered: false
                }
            );
        }


        console.log(
            "Supplier-product relationships imported"
        );


        // ==========================================
        // FINAL SUMMARY
        // ==========================================

        console.log("");
        console.log(
            "================================"
        );

        console.log(
            "Olist import completed successfully"
        );

        console.log(
            `Products: ${insertedProducts.length}`
        );

        console.log(
            `Suppliers: ${insertedSuppliers.length}`
        );

        console.log(
            `Relationships: ${relationships.length}`
        );

        console.log(
            "================================"
        );


    } catch (error) {

        console.error(
            "Olist import error:",
            error.message
        );

    } finally {

        await mongoose.disconnect();
    }
};


// ==========================================
// RUN SCRIPT
// ==========================================

importOlistData();
