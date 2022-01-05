const sql = require("../utils/mysql")

const Article = function (data) {
    this.author_id = data.author_id
    this.title = data.title
    this.body = data.body
}

Article.create = (data, result) => {
    sql.query("INSERT INTO articles SET ?", data, (error, res) => {
        if (error) return result(error, null)
        return result(null, {
            id: res.insertId,
            ...data
        })
    })
}

Article.getAll = async (qry, author, page, result) => {
    let query = "SELECT name as author, title, body, created_at FROM articles INNER JOIN authors ON articles.author_id = authors.id"

    if (qry || author) {
        query += ` WHERE`
        if (qry) {
            query += ` title LIKE ${sql.escape(`%${qry}%`)} OR body LIKE ${sql.escape(`%${qry}%`)}`
            if (author) {
                query += ` AND`
            }
        }

        if (author) {
            query += ` author_id = (SELECT id FROM authors WHERE name LIKE ${sql.escape(`%${author}%`)})`
        }
    }

    let totalArticles = 0;

    await sql.query(query, (err, res) => {
        totalArticles = res.length
    })

    // Pagination and sort by latest.
    const limit = 10 // 10 articles per page.
    const offset = (page - 1) * limit // Calculate offset.

    query += ` ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`

    sql.query(query, (err, res) => {
        if (err) return result(err, null)
        const totalpages = Math.ceil(totalArticles / limit)
        const data = {
            current_page: page,
            total_pages: totalpages,
            total_articles: totalArticles,
            articles: res
        }

        return result(null, data)
    })
}

module.exports = Article
