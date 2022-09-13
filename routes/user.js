const express = require("express");
const router = express.Router();
const { viewAllUsers } = require("../controller/user");

router.route("/user").get(viewAllUsers);

module.exports = router;
