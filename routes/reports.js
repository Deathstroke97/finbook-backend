const express = require("express");

const router = express.Router();

const reportController = require("../controllers/report");

router.post("/report/cashflow", reportController.getCashFlowReport);

router.post("/report/profitAndLoss", reportController.getProfitAndLossReport);

module.exports = router;
