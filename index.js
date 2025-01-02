const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
require("dotenv").config();

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

// declaring routes // get all the json data from the database
app.get("/", (req, res) => {
  console.log("/");
  // res.status(201).send('Hello from server')
  const sql = "SELECT * FROM addresses";
  const id = req.params.id;
  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).send(err);
    } else {
      res.json(result);
    }
  });
});

// find by id
app.get("/address/:id", (req, res) => {
  console.log("/address");
  const sql = "SELECT * FROM addresses WHERE id = ?";
  db.query(sql, [req.params.id], (err, result) => {
    //
    if (err) {
      return res.status(500).send("Address not found", err);
    }
    //
    if (result.length === 0) {
      return res.status(500).send("Address not found", err);
    }
    //
    res.json(result[0]);
  });
});

// {
//     "id": 5,
//     "name": "Eve Brown",
//     "email": "eve.brown@example.com",
//     "phone": "5678901234",
//     "address": "987 Birch St"
// }

// Save and update route
app.post("/save", (req, res) => {
  console.log("/save");
  //
  const { id, name, email, phone, address } = req.body;
  // Validate required fields
  if (!name || !email || !phone || !address) {
    return res
      .status(400)
      .send("All fields (name, email, phone, address) are required.");
  }

  if (!id) {
    // Create a new database row
    db.query(
      "INSERT INTO addresses (name, email, phone, address) VALUES (?, ?, ?, ?)",
      [name, email, phone, address],
      (err, result) => {
        if (err) {
          console.error("Error inserting data:", err);
          return res.status(500).send("Failed to save address.");
        }
        //
        res.status(201).send("Address saved successfully.");
      }
    );
  } else {
    // Update an existing database row
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
        //
        res.send("Address updated successfully.");
      }
    );
  }
});

// delete by id
app.delete("/delete/:id", (req, res) => {
  const sql = "DELETE FROM addresses WHERE id = ?";
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).send(err);
    if (result.affectedRows === 0)
      return res.status(404).send("Address not found");
    res.json({ message: "Address deleted successfully" });
  });
});

//
app.listen(port, () => {
  console.log(`listening on port ${port}`);
});


// Input data validation
// Data sanitization
//
// Next.js tutorial
// Next.js projects

