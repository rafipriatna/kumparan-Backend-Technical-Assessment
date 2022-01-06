const express = require("express");
const cluster = require("cluster");
const app = express();
const totalCPU = require("os").cpus().length;
const articleRoute = require("./app/routes/article.route")

if (cluster.isMaster && process.env.NODE_ENV !== 'test') {
    for (let i = 0; i < totalCPU; i++) {
        cluster.fork();
    }
} else {
    setup()
}

function setup() {
    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))
    app.get("/", (req, res) => {
        res.json({ message: "Halo dunia!" });
    });

    app.use(articleRoute)

    app.listen(8000, () => {
        console.log("Server is running on port 8000")
    })
}

module.exports = app;
