const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const bcrypt = require("bcrypt");
const cron = require("node-cron");
const fs = require('fs');
const dns = require('dns');

// 🔥 DNS Fix para sa MongoDB Atlas connectivity issues
dns.setServers(['8.8.8.8', '1.1.1.1']);

const app = express();

// ===========================
// MIDDLEWARE & CORS
// ===========================
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());

if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// ===========================
// IMAGE STORAGE (Multer)
// ===========================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });
app.use("/uploads", express.static("uploads"));

// ===========================
// MONGODB CONNECTION
// ===========================
mongoose
  .connect("mongodb+srv://reicha:charm123@cluster0.vnlcxrd.mongodb.net/FarmOpsDB?retryWrites=true&w=majority")
  .then(() => console.log("✅ MongoDB Connected (with DNS fix)"))
  .catch((err) => console.log("❌ MongoDB Error:", err));

// ===========================
// SCHEMAS & MODELS
// ===========================
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  middleName: { type: String, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["employee", "admin"], default: "employee" },
  section: { type: String, default: "Inventory" },
  status: { type: String, enum: ["pending", "approved"], default: "pending" },
}, { timestamps: true });
const User = mongoose.model("User", userSchema);

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  stock: Number,
  section: { type: String, default: "Inventory" },
  image: String,
}, { timestamps: true });
const Product = mongoose.model("Product", productSchema);

const earningsSchema = new mongoose.Schema({
  employeeEmail: String,
  amount: Number,
  month: Number,
  year: Number
}, { timestamps: true });
const Earnings = mongoose.model("Earnings", earningsSchema);

const reportSchema = new mongoose.Schema({
  dailyEarnings: { type: Number, default: 0 },
  dailyHistory: [{ date: String, total: Number }],
});
const Report = mongoose.model("Report", reportSchema);

// ===========================
// CUSTOM MIDDLEWARE
// ===========================
const inventoryAccess = async (req, res, next) => {
  try {
    const userId = req.headers.userid;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.role === "admin" || user.section === "Inventory") return next();
    return res.status(403).json({ error: "Inventory access only" });
  } catch (err) {
    res.status(500).json({ error: "Access validation failed" });
  }
};

// ===========================
// AUTH & USER PROFILE ROUTES
// ===========================

// EMPLOYEE REGISTER
app.post("/api/register", async (req, res) => {
  try {
    const { firstName, middleName, lastName, email, password, section } = req.body;
    const existing = await User.findOne({ email: email.trim().toLowerCase() });
    if (existing) return res.status(400).json({ error: "Email exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({
      firstName, middleName, lastName,
      email: email.trim().toLowerCase(),
      password: hashed,
      section: section || "Inventory",
      role: "employee",
      status: "pending",
    });
    await user.save();
    res.status(201).json({ message: "Employee registered successfully!" });
  } catch (err) {
    res.status(500).json({ error: "Registration failed" });
  }
});

// ADMIN REGISTER
app.post("/api/register-admin", async (req, res) => {
  try {
    const { firstName, middleName, lastName, email, password } = req.body;
    const existing = await User.findOne({ email: email.trim().toLowerCase() });
    if (existing) return res.status(400).json({ error: "Email exists" });

    const hashed = await bcrypt.hash(password, 10);
    const adminUser = new User({
      firstName, middleName, lastName,
      email: email.trim().toLowerCase(),
      password: hashed,
      role: "admin",
      status: "approved",
      section: "Management"
    });

    await adminUser.save();
    res.status(201).json({ message: "Admin registered successfully!" });
  } catch (err) {
    res.status(500).json({ error: "Admin registration failed" });
  }
});

// LOGIN
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: "Invalid credentials" });
    if (user.status !== "approved") return res.status(403).json({ error: "Waiting for admin approval" });

    res.json({
      message: "Login success",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email, 
        role: user.role,
        section: user.section,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

// ✏️ UPDATE USER NAME (Ang in-update na route)
app.put("/api/users/update-name", async (req, res) => {
  try {
    const { email, firstName, lastName } = req.body;
    
    // Server-side validation
    if (!firstName || !lastName) {
      return res.status(400).json({ error: "First name and Last name are required" });
    }

    const updatedUser = await User.findOneAndUpdate(
      { email: email.trim().toLowerCase() },
      { 
        firstName: firstName.trim(), 
        lastName: lastName.trim() 
      },
      { new: true } // I-return ang updated version ng document
    );

    if (!updatedUser) return res.status(404).json({ error: "User not found" });

    // I-return ang buong user object para ma-update ang state at localStorage sa frontend
    res.json({
      message: "Name updated successfully",
      user: {
        id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        role: updatedUser.role,
        section: updatedUser.section,
      }
    });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: "Failed to update name" });
  }
});

// ===========================
// ADMIN & PRODUCTS ROUTES
// ===========================
app.get("/api/employees", async (req, res) => {
  const employees = await User.find({ role: "employee" }).sort({ createdAt: -1 });
  res.json(employees);
});

app.put("/api/employees/approve/:id", async (req, res) => {
  const emp = await User.findByIdAndUpdate(req.params.id, { status: "approved" }, { new: true });
  res.json({ message: "Employee approved", employee: emp });
});

app.post("/api/products", inventoryAccess, upload.single("image"), async (req, res) => {
  try {
    const { name, price, stock, section } = req.body;
    const product = new Product({
      name, price, stock, section,
      image: req.file ? `/uploads/${req.file.filename}` : ""
    });
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Failed to add product" });
  }
});

app.get("/api/products", inventoryAccess, async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// ===========================
// EARNINGS & REPORTS
// ===========================
app.post("/api/earnings", async (req, res) => {
  try {
    const { employeeEmail, amount } = req.body;
    const today = new Date().toLocaleDateString();

    await new Earnings({
      employeeEmail,
      amount: Number(amount),
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    }).save();

    const report = await Report.findOneAndUpdate(
      {},
      { $inc: { dailyEarnings: Number(amount) } },
      { upsert: true, new: true }
    );

    const existingIndex = report.dailyHistory.findIndex(d => d.date === today);
    if (existingIndex >= 0) {
      report.dailyHistory[existingIndex].total += Number(amount);
    } else {
      report.dailyHistory.push({ date: today, total: Number(amount) });
    }
    await report.save();
    res.json({ message: "Income recorded" });
  } catch (err) {
    res.status(500).json({ error: "Submit failed" });
  }
});

app.get("/api/reports", async (req, res) => {
  try {
    const today = new Date().toLocaleDateString();
    let report = await Report.findOne();
    if (!report) {
      report = new Report({ dailyEarnings: 0, dailyHistory: [] });
      await report.save();
    }
    const lastEntry = report.dailyHistory[report.dailyHistory.length - 1];
    if (!lastEntry || lastEntry.date !== today) {
      report.dailyHistory.push({ date: today, total: 0 });
      report.dailyEarnings = 0;
      await report.save();
    }
    res.json({ dailyEarnings: report.dailyEarnings, dailyHistory: report.dailyHistory });
  } catch (err) {
    res.status(500).json({ error: "Report fetch failed" });
  }
});

// ===========================
// CRON JOB (Midnight Reset)
// ===========================
cron.schedule("0 0 * * *", async () => {
  const report = await Report.findOne();
  if (report) {
    report.dailyHistory.push({
      date: new Date().toLocaleDateString(),
      total: report.dailyEarnings
    });
    report.dailyEarnings = 0;
    await report.save();
    console.log("📅 Daily reset completed.");
  }
}, { timezone: "Asia/Manila" });

// ===========================
// SERVER
// ===========================
app.get("/", (req, res) => res.send("🚀 FarmOps API is Running"));
app.listen(5000, () => console.log("🚀 Server running on http://localhost:5000"));