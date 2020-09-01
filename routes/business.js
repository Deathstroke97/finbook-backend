const express = require("express");

const router = express.Router();

const businessController = require("../controllers/business");

const isAuth = require("../middleware/is_auth");

router.put("/business", isAuth, businessController.updateBusiness);

module.exports = router;
