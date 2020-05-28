const express = require("express");

const router = express.Router();

const reportController = require("../controllers/report");

router.post("/report/cashflow", reportController.getCashFlow);

// router.post("/report/profitAndLoss", reportController.getProfitAndLoss);

module.exports = router;
