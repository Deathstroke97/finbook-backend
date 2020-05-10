const express = require("express");

const router = express.Router();

const accountController = require("../controllers/account");

router.post("/accounts", accountController.getAccounts);

router.post("/account", accountController.createAccount);

router.put("/account/:accountId", accountController.updateAccount);

router.delete("/account/:accountId", accountController.deleteAccount);

module.exports = router;
