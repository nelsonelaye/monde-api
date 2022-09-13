require("dotenv").config();
const mysql = require("mysql");
const mysqlConnection = require("../config/mysql");
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const router = express.Router();
const { validateUser } = require("../config/validate");

router.get("/user", async (req, res) => {
  try {
    const sql = "SELECT * FROM users";

    mysqlConnection.query(sql, (err, result) => {
      if (err) {
        res.status(400).json({
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

router.get("/user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const sql = "SELECT * FROM users WHERE id=";
    mysqlConnection.query(sql + mysql.escape(userId), (err, result) => {
      if (err) {
        res.status(400).json({
          message: err.message,
        });
      } else if (result.length <= 0) {
        res.status(404).json({
          message: "user not found",
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

router.post("/user", async (req, res) => {
  try {
    const { username, email, gender, password } = req.body;

    const { error } = await validateUser(req.body);

    if (error) {
      res.status(400).json({
        message: error.message,
      });
    } else {
      //if user schema is validated, find any duplicate data to prevent triggering auto_increment
      const sql = "SELECT * FROM users WHERE email=?";
      mysqlConnection.query(sql, [email], async (err, result) => {
        if (err) {
          res.status(400).json({
            message: err.message,
          });

          //if DUP, alert user
        } else if (result.length > 0) {
          res.status(409).json({
            message: "user with email already exist",
          });

          //if no DUP, go ahead to create new user
        } else {
          const salted = await bcrypt.genSaltSync(16);
          const hashed = await bcrypt.hash(password, salted);

          const newsql =
            "INSERT INTO users (username, email, gender, password) VALUES ?";

          const values = [[username, email, gender, hashed]];

          mysqlConnection.query(newsql, [values], (err, result) => {
            if (err && err.errno == 1062) {
              res.status(400).json({
                message: "user with email already exist",
              });
            } else if (err) {
              res.status(400).json({
                message: err.message,
              });
            } else {
              res.status(201).json({
                data: result,
                message: "user created",
              });
            }
          });
        }
      });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

router.post("/user/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const sql = "SELECT * FROM users WHERE email=?";

    mysqlConnection.query(sql, [email], async (err, result) => {
      if (err) {
        res.status(400).json({
          message: err.message,
        });
      } else if (result.length <= 0) {
        res.status(404).json({
          message: "user not found",
        });
      } else {
        const user = result[0];
        const checkPassword = await bcrypt.compare(password, user.password);

        if (checkPassword) {
          const { password, ...rest } = user;
          const token = jwt.sign(
            {
              id: user.id,
              username: user.username,
              email: user.email,
              gender: user.gender,
            },
            process.env.SECRETTOKEN,
            { expiresIn: process.env.EXPIRES }
          );

          res.status(200).json({
            data: { token, ...rest },
          });
        } else {
          res.status(400).json({
            message: "password is incorrect",
          });
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

router.delete("/user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const sql = "DELETE FROM users WHERE id=";

    mysqlConnection.query(sql + mysql.escape(userId), (err, result) => {
      if (err) {
        res.status(400).json({
          message: err.message,
        });
      } else if (result.affectedRows == 0) {
        res.status(404).json({
          message: "user not found",
        });
      } else {
        res.status(200).json({
          message: result,
        });
      }
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

router.patch("/user/:userId", async (req, res) => {
  try {
    const { username, gender } = req.body;
    const userId = req.params.userId;

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
          const data = result[0];

          const sql = `UPDATE IGNORE users SET username=?, gender=? WHERE id=?`;
          mysqlConnection.query(
            sql,
            [username || data.username, gender || gender.gender, userId],
            (err, result) => {
              if (err) {
                res.status(400).json({
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
      }
    );
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

router.get("/user/:userId/book", async (req, res) => {
  try {
    const userId = req.params.userId;
    const sql = "SELECT * FROM books WHERE userId=";
    mysqlConnection.query(sql + mysql.escape(userId), (err, result) => {
      if (err) {
        res.statusCode(500).json({
          message: error.message,
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
module.exports = router;
