const express = require("express");

const router = express.Router();

const reportController = require("../controllers/report");

const isAuth = require("../middleware/is_auth");

router.post("/report/cashflow", isAuth, reportController.getCashFlowReport);

router.post(
  "/report/profitAndLoss",
  isAuth,
  reportController.getProfitAndLossReport
);

module.exports = router;
