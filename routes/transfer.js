const express = require("express");

const router = express.Router();

const transferController = require("../controllers/transfer");

router.post("/transfers", transferController.getTransfers);

router.post("/transfer", transferController.createTransfer);

router.put("/transfer/:transferId", transferController.updateTransfer);

router.delete("/transfer/:transferId", transferController.deleteTransfer);

module.exports = router;
