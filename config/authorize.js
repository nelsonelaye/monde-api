const jwt = require("jsonwebtoken");
require("dotenv").config();

const authorize = (req, res, next) => {
  const auth = req.headers.authorization;

  if (!auth) {
    res.status(500).json({
      message: "Access denied. Login to continue",
    });
  } else {
    const token = auth.split(" ")[1];

    if (!token) {
      res.status(500).json({
        message: "user not authorized",
      });
    } else {
      jwt.verify(token, process.env.SECRETTOKEN, (err, payload) => {
        if (err) {
          res.status(500).json({
            message: err.message,
          });
        } else {
          req.user = payload;
          next();
        }
      });
    }
  }
};

module.exports = authorize;
