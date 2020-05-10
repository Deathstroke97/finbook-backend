const express = require("express");

const router = express.Router();

const obligationController = require("../controllers/obligation");

router.post("/obligations", obligationController.getObligations);

router.post("/obligation", obligationController.createObligation);

router.put("/obligation/:obligationId", obligationController.updateObligation);

router.delete(
  "/obligation/:obligationId",
  obligationController.deleteObligation
);

module.exports = router;
