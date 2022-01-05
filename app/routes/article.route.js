const express = require("express");
const router = express.Router();

const controller = require("../controllers/article.controller")

router.get("/articles/:page?", controller.getAll);
router.post("/articles", controller.create);

module.exports = router;
