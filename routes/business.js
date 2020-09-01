const express = require("express");

const router = express.Router();

const businessController = require("../controllers/business");

const isAuth = require("../middleware/is_auth");

router.put("/business", isAuth, businessController.updateBusiness);

router.get("/business", isAuth, businessController.getBusiness);

module.exports = router;
