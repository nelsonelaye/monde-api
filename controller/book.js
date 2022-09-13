const mysql = require("mysql");
const mysqlConnection = require("../config/mysql");
const express = require("express");
const router = express.Router();
const authorize = require("../config/authorize");

router.get("/book", async (req, res) => {
  try {
    const sql = "SELECT * FROM books";

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

router.get("/book/:bookId", async (req, res) => {
  try {
    const bookId = req.params.bookId;
    const sql = "SELECT * FROM books WHERE id=";

    mysqlConnection.query(sql + mysql.escape(bookId), (err, result) => {
      if (err) {
        res.status(500).json({
          message: err.message,
        });
      } else if (!result[0]) {
        res.status(404).json({
          message: "book not found",
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

router.post("/user/:userId/book", authorize, async (req, res) => {
  try {
    const userId = req.params.userId;
    const { title, author, overview, category } = req.body;

    //check if user exists
    mysqlConnection.query(
      "SELECT * FROM users WHERE id=" + mysql.escape(userId),
      (err, result) => {
        if (err) {
          res.status(500).json({
            message: err.message,
          });
        } else if (!result[0]) {
          res.status(404).json({
            message: "user not found",
          });
        } else {
          mysqlConnection.query(
            "SELECT * FROM books WHERE title=?",
            [title],
            (err, result) => {
              if (err) {
                res.status(500).json({
                  message: err.message,
                });
              } else if (result[0]) {
                res.status(409).json({
                  message: "book already exists",
                });
              } else {
                const sql =
                  "INSERT INTO books (title, author, overview, categoryId, userId) VALUES ?";
                const values = [[title, author, overview, category, userId]];

                mysqlConnection.query(sql, [values], (err, result) => {
                  if (err) {
                    res.status(500).json({
                      message: err.message,
                    });
                  } else {
                    res.status(201).json({
                      data: result,
                      message: "new book added",
                    });
                  }
                });
              }
            }
          );
        }
      }
    );
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

router.patch("/book/:bookId", authorize, async (req, res) => {
  try {
    const { title, author, overview, category } = req.body;
    const bookId = req.params.bookId;

    mysqlConnection.query(
      "SELECT * FROM books WHERE id =" + mysql.escape(bookId),
      (err, result) => {
        if (err) {
          res.status(500).json({
            message: err.message,
          });
        } else if (!result[0]) {
          res.status(404).json({
            message: "book not found",
          });
        } else {
          const data = result[0];
          const sql =
            "UPDATE IGNORE books SET title=?, author=?, overview=? WHERE id=?";
          const values = [[title, author, overview, category, bookId]];

          mysqlConnection.query(
            sql,
            [
              title || data.title,
              author || data.author,
              overview || data.overview,
              category || data.category,
              bookId,
            ],
            (err, result) => {
              if (err) {
                res.status(500).json({
                  message: err.message,
                });
              } else {
                res.status(200).json({
                  data: result,
                  message: "book updated",
                });
              }
            }
          );
        }
      }
    );
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

router.delete("/book/:bookId", (req, res) => {
  try {
    const bookId = req.params.bookId;
    const sql = "DELETE FROM books WHERE id=";
    mysqlConnection.query(sql + mysql.escape(bookId), (err, result) => {
      if (err) {
        res.status(500).json({
          message: err.message,
        });
      } else if (result.affectedRows <= 0) {
        res.status(404).json({
          message: "book not found",
        });
      } else {
        res.status(200).json({
          data: result,
          message: "book deleted",
        });
      }
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;
