const express = require("express");
const router = express.Router();

router.post("/", (req, res) => {
  res.json({ message: "Designer created", data: req.body });
});

router.get("/:id", (req, res) => {
  res.json({ message: "Get designer", id: req.params.id });
});

module.exports = router;