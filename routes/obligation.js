const express = require("express");

const router = express.Router();

const isAuth = require("../middleware/is_auth");

const obligationController = require("../controllers/obligation");

router.post("/obligations", isAuth, obligationController.getObligations);

router.post("/obligation", isAuth, obligationController.createObligation);

router.put(
  "/obligation/:obligationId",
  isAuth,
  obligationController.updateObligation
);

router.delete(
  "/obligation/:obligationId",
  isAuth,
  obligationController.deleteObligation
);

module.exports = router;
