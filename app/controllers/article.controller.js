const Article = require("../models/article.model")

exports.create = (req, res) => {
    if (Object.keys(req.body).length === 0) return res.status(400).json({ message: "Article cannot be empty!" })

    const values = new Article({
        author_id: req.body.author_id,
        title: req.body.title,
        body: req.body.body,
    })

    Article.create(values, (err, data) => {
        if (err) return res.status(500).json({ message: err.message || "Internal Server Error." })

        return res.json({ message: "Success create an article.", data })
    })
}

exports.getAll = (req, res) => {
    const qry = req.query.query
    const author = req.query.author
    const page = req.params.page < 0 ? 1 : parseInt(req.params.page) || 1

    Article.getAll(qry, author, page, (err, data) => {
        if (err) return res.status(500).json({ message: err.message || "Internal Server Error." })

        return res.json({ message: "List of articles.", data })
    })
}
