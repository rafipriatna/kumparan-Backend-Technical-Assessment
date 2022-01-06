const NodeCache = require("node-cache");
const myCache = new NodeCache();
const sql = require("../utils/mysql")

const Article = function (data) {
    this.author_id = data.author_id
    this.title = data.title
    this.body = data.body
}

Article.create = (data, result) => {
    sql.query("INSERT INTO articles SET ?", data, (error, res) => {
        if (error) return result(error, null)
        const articleData = {
            id: res.insertId,
            ...data
        }
        myCache.del("articles");
        return result(null, articleData, "Article created.")
    })
}

Article.getAll = async (qry, author, page, result) => {
    const limit = 10
    let value = myCache.get("articles");
    let totalArticles = 0

    if (value != undefined) {
        let articles = value
        totalArticles = articles.length
        if (qry || author) {
            let tempArticle = filter(articles, qry, author)
            totalArticles = tempArticle.length
            articles = paginate(tempArticle, limit, page)
        } else {
            articles = paginate(articles, limit, page)
        }
        const pagination = paginationResponse(totalArticles, limit, page)

        return result(null, response(articles, pagination), "List of all articles from cache.")
    } else {
        let query = "SELECT name as author, title, body, created_at FROM articles INNER JOIN authors ON articles.author_id = authors.id ORDER BY created_at DESC"

        sql.query(query, (err, res) => {
            if (err) return result(err, null)

            totalArticles = res.length
            let articles = []
            res.map(item => {
                articles.push({
                    author: item.author,
                    title: item.title,
                    body: item.body,
                    created_at: item.created_at,
                })
            })

            myCache.set("articles", articles, 10000);

            if (qry || author) {
                let tempArticle = filter(articles, qry, author)
                totalArticles = tempArticle.length
                articles = paginate(tempArticle, limit, page)
            } else {
                articles = paginate(articles, limit, page)
            }
            const pagination = paginationResponse(totalArticles, limit, page)

            return result(null, response(articles, pagination), "List of all articles.")
        })
    }
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
    return article.slice((current - 1) * size, current * size);
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

function response(article, pagination) {
    return {
        pagination,
        total_articles: article.length,
        article: article
    }
}

module.exports = Article
