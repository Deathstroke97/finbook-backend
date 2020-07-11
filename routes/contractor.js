const express = require("express");

const router = express.Router();

const contractorController = require("../controllers/contractor");

const isAuth = require("../middleware/is_auth");

router.get("/contractors", isAuth, contractorController.getContractors);

router.post("/contractor", isAuth, contractorController.createContractor);

router.put(
  "/contractor/:contractorId",
  isAuth,
  contractorController.updateContractor
);

router.delete(
  "/contractor/:contractorId",
  isAuth,
  contractorController.deleteContractor
);

router.get(
  "/contractor/:contractorId",
  isAuth,
  contractorController.getContractor
);

module.exports = router;
