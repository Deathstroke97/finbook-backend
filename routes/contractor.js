const express = require("express");

const router = express.Router();

const contractorController = require("../controllers/contractor");

router.post("/contractors", contractorController.getContractors);

router.post("/contractor", contractorController.createContractor);

router.put("/contractor/:contractorId", contractorController.updateContractor);

router.delete(
  "/contractor/:contractorId",
  contractorController.deleteContractor
);

module.exports = router;
