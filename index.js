const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
require("dotenv").config();
const { addressSchema } = require("./src/validation/addressValidation");
const validate = require("./src/middleware/validate");

const port = process.env.PORT || 3000;
const app = express();

// middleware
app.use(bodyParser.json());

// MySql connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.log("Database connection failed", err);
    return;
  } else {
    console.log("Connected to MySql Successfully");
  }
});

// Get all addresses
app.get("/", (req, res) => {
  const sql = "SELECT * FROM addresses";
  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).send(err);
    } else {
      res.json(result);
    }
  });
});

// Get address by ID
app.get("/address/:id", (req, res) => {
  const sql = "SELECT * FROM addresses WHERE id = ?";
  db.query(sql, [req.params.id], (err, result) => {
    if (err) {
      return res.status(500).send("Address not found", err);
    }
    if (result.length === 0) {
      return res.status(404).send("Address not found");
    }
    res.json(result[0]);
  });
});

// Save or update address
app.post("/save", validate(addressSchema), (req, res) => {
  const { id, name, email, phone, address } = req.body;

  if (!id) {
    db.query(
      "INSERT INTO addresses (name, email, phone, address) VALUES (?, ?, ?, ?)",
      [name, email, phone, address],
      (err, result) => {
        if (err) {
          console.error("Error inserting data:", err);
          return res.status(500).send("Failed to save address.");
        }
        res.status(201).send("Address saved successfully.");
      }
    );
  } else {
    db.query(
      "UPDATE addresses SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?",
      [name, email, phone, address, id],
      (err, result) => {
        if (err) {
          console.error("Error updating data:", err);
          return res.status(500).send("Failed to update address.");
        }
        if (result.affectedRows === 0) {
          return res.status(404).send("Address not found.");
        }
        res.send("Address updated successfully.");
      }
    );
  }
});

// Delete address by ID
app.delete("/delete/:id", (req, res) => {
  const sql = "DELETE FROM addresses WHERE id = ?";
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).send(err);
    if (result.affectedRows === 0) return res.status(404).send("Address not found");
    res.json({ message: "Address deleted successfully" });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
