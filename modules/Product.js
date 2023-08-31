const mongoose = require("mongoose");
const { isEmail } = require("validator");

const ProductSchema = new mongoose.Schema(
  {
    Name: {
      type: String,
      required: [true, "Provide a Product Name"],
      unique: true,
    },
    category: { type: String },
    image: {
      type: String,
    },
    WareHouse_Price: { type: Number, required: true },
    Market_Price: { type: Number, required: true },
    Van_Price: { type: Number, required: true },
    vendor_Price: {
      type: Number,
      required: true,
    },
    Vendor: { type: String, required: [true, "Provide vendor"] },
    UMO: { type: String },
    color: { type: String },
    Description: { type: String },
    Sellable: {
      type: Boolean,
      required: true,
      default: false,
    },
    Ecom_sale: { type: Boolean },
    Manufacturer: { type: String },
    Manufacture_code: { type: String },
    product_code: { type: String },
    ACDcode: { type: String },
    VAT: { type: Number, default: 0 },
    ActivityLog: {
      type: Array,
    },
    virtualQty:{
      type: Number,
      default: 0,
      minimum:0
    }
  },
  { timestamps: true }
);

const Product = mongoose.model(" Products", ProductSchema);

module.exports = Product;
