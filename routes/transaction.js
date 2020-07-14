const express = require("express");

const router = express.Router();

const transactionController = require("../controllers/transaction");

const isAuth = require("../middleware/is_auth");

router.post("/transactions", isAuth, transactionController.getTransactions);

router.post("/transaction", isAuth, transactionController.createTransaction);

router.put("/transaction", isAuth, transactionController.updateTransaction);

router.delete(
  "/transaction/:transactionId",
  isAuth,
  transactionController.deleteTransaction
);

router.post(
  "/transaction/cancelRepetition",
  isAuth,
  transactionController.cancelRepetition
);

module.exports = router;
