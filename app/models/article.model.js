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
        return result(null, articleData)
    })
}

Article.getAll = async (result) => {
    let query = "SELECT name as author, title, body, created_at FROM articles INNER JOIN authors ON articles.author_id = authors.id ORDER BY created_at DESC"

    sql.query(query, (err, res) => {
        if (err) return result(err, null)

        return result(null, res)
    })
}

module.exports = Article
