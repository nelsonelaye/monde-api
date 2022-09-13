const mysql = require("mysql");
const mysqlConnection = require("../config/mysql");
const express = require("express");
const router = express.Router();

router.get("/category", async (req, res) => {
  try {
    const sql = "SELECT * FROM book_categories";
    mysqlConnection.query(sql, (err, result) => {
      if (err) {
        res.status(500).json({
          message: err.message,
        });
      } else {
        res.status(200).json({
          data: result,
        });
      }
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

router.get("/category/:categoryId", async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const sql = "SELECT * FROM book_categories WHERE id=";
    mysqlConnection.query(sql + mysql.escape(categoryId), (err, result) => {
      if (err) {
        res.status(500).json({
          message: err.message,
        });
      } else if (!result[0]) {
        res.status(404).json({
          message: "category not found",
        });
      } else {
        res.status(200).json({
          data: result,
        });
      }
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

router.post("/category", async (req, res) => {
  try {
    const { name } = req.body;
    mysqlConnection.query(
      "SELECT * FROM book_categories WHERE name=?",
      [name],
      (err, result) => {
        if (err) {
          res.status(500).json({
            message: err.message,
          });
        } else if (result[0]) {
          res.status(409).json({
            message: "category already exists",
          });
        } else {
          const sql = "INSERT INTO book_categories (name) VALUES ?";

          const values = [[name]];

          mysqlConnection.query(sql, [values], (err, result) => {
            if (err) {
              res.status(500).json({
                message: err.message,
              });
            } else {
              res.status(201).json({
                data: result,
                message: "new category added",
              });
            }
          });
        }
      }
    );
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

router.delete("/category/:categoryId", async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const sql = "DELETE FROM book_categories WHERE id=";
    mysqlConnection.query(sql + mysql.escape(categoryId), (err, result) => {
      if (err) {
        res.status(500).json({
          message: err.message,
        });
      } else if (result.affectedRows <= 0) {
        res.status(404).json({
          message: "category not found",
        });
      } else {
        res.status(200).json({
          data: result,
          message: "category deleted",
        });
      }
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

router.patch("/category/:categoryId", async (req, res) => {
  try {
    const { name } = req.body;
    const categoryId = req.params.categoryId;
    const sql = "UPDATE book_categories SET name=? WHERE id=?";
    mysqlConnection.query(sql, [name, categoryId], (err, result) => {
      if (err) {
        res.status(500).json({
          message: err.message,
        });
      } else if (result.affectedRows <= 0) {
        res.status(404).json({
          message: "category not found",
        });
      } else {
        res.status(200).json({
          data: result,
          message: "category updated",
        });
      }
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

router.get("/category/:categoryId/book", async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const sql = "SELECT * FROM book_categories WHERE id=";
    mysqlConnection.query(sql + mysql.escape(categoryId), (err, result) => {
      if (err) {
        res.status(500).json({
          message: err.message,
        });
      } else if (!result[0]) {
        res.status(404).json({
          message: "category not found",
        });
      } else {
        mysqlConnection.query(
          "SELECT * FROM books WHERE categoryId=" + mysql.escape(categoryId),
          (err, result) => {
            if (err) {
              res.status(500).json({
                message: err.message,
              });
            } else {
              res.status(200).json({
                data: result,
              });
            }
          }
        );
      }
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;
