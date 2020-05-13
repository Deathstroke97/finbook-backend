const express = require("express");

const router = express.Router();

const transactionController = require("../controllers/transaction");

router.post("/transactions", transactionController.getTransactions);

router.post("/transaction", transactionController.createTransaction);

// router.put(
//   "/transaction/:transactionId",
//   transactionController.updateTransaction
// );

// router.delete(
//   "/transaction/:transactionId",
//   transactionController.deleteTransaction
// );

module.exports = router;
