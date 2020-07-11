const express = require("express");

const router = express.Router();

const accountController = require("../controllers/account");

const isAuth = require("../middleware/is_auth");

router.get("/accounts", isAuth, accountController.getAccounts);

router.post("/account", isAuth, accountController.createAccount);

router.put("/account/:accountId", isAuth, accountController.updateAccount);

router.delete("/account/:accountId", isAuth, accountController.deleteAccount);

module.exports = router;
