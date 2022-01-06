const Article = require("../models/article.model")
const NodeCache = require("node-cache")
const cache = new NodeCache()

exports.create = async (req, res) => {
    if (Object.keys(req.body).length === 0) return res.status(400).json({ message: "Article cannot be empty!" })

    const values = new Article({
        author_id: req.body.author_id,
        title: req.body.title,
        body: req.body.body,
    })

    Article.create(values, async (err, data) => {
        if (err) return res.status(500).json({ message: err.message || "Internal Server Error." })

        Article.getAll(async (err, dataArticles) => {
            if (err) return res.status(500).json({ message: err.message || "Internal Server Error." })
            let articles = fetchData(dataArticles)
            await cache.set("articles", articles, 100000)
            return res.json({ message: "Article created.", data })
        })
    })
}

exports.getAll = (req, res) => {
    const qry = req.query.query
    const author = req.query.author
    const page = req.params.page < 0 ? 1 : parseInt(req.params.page) || 1
    let cached = cache.get("articles")

    if (cached) {
        let articles = cached
        totalArticles = articles.length
        return res.json({ message: "List of all articles from cache.", data: response(articles, totalArticles, page, qry, author) })
    } else {
        Article.getAll((err, dataArticles) => {
            if (err) return res.status(500).json({ message: err.message || "Internal Server Error." })

            let articles = fetchData(dataArticles)
            totalArticles = articles.length

            cache.set("articles", articles, 100000)

            return res.json({ message: "List of all articles.", data: response(articles, totalArticles, page, qry, author) })
        })
    }
}

function fetchData(data) {
    let articles = []
    data.map(item => {
        articles.push({
            author: item.author,
            title: item.title,
            body: item.body,
            created_at: item.created_at,
        })
    })
    return articles
}

function paginationResponse(totalArticles, limit, currentPage) {
    const url = "http://localhost:8000/api/articles/"
    const totalPages = Math.ceil(totalArticles / limit)
    const current = url + currentPage
    const previous = (currentPage - 1) < 1 ? null : url + (currentPage - 1)
    const next = (currentPage + 1) > totalPages ? null : url + (currentPage + 1)

    return {
        total: totalPages,
        current,
        previous,
        next
    }
}

function paginate(article, size, current) {
    return article.slice((current - 1) * size, current * size)
}

function filter(articles, query, author) {
    if (query) {
        let filtered = articles.filter(item => item.title.includes(query) || item.body.includes(query))

        if (author) {
            return filtered.filter(item => item.author.includes(author))
        }

        return filtered
    }

    if (author) {
        return articles.filter(item => item.author.includes(author))
    }
}

function response(articles, totalArticles, page, qry, author) {
    const limit = 10
    const pagination = paginationResponse(totalArticles, limit, page)

    if (qry || author) {
        let tempArticle = filter(articles, qry, author)
        totalArticles = tempArticle.length
        articles = paginate(tempArticle, limit, page)
    } else {
        articles = paginate(articles, limit, page)
    }
    return {
        pagination,
        total_articles: totalArticles,
        article: articles
    }
}
