const chai = require('chai');
const chaiHttp = require('chai-http');
const url = "http://localhost:8000"

chai.use(chaiHttp);
chai.should();

describe("Articles Test", () => {
    describe("GET /artice", () => {
      it("should get all articles", (done) => {
        chai.request(url)
          .get('/articles')
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            done();
          });
      });

      it("should get all articles with filter by query (title or body)", (done) => {
        const query = "coba artikel";
        chai.request(url)
          .get(`/articles/?query=${query}`)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            done();
          });
      });
      
      it("should get all articles with filter by author name", (done) => {
        const author = "Rafi";
        chai.request(url)
          .get(`/articles/?author=${author}`)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            done();
          });
      });
  
      it("should get all articles with filter by author name and query (title or body)", (done) => {
        const author = "Rafi";
        const query = "coba artikel";
        chai.request(url)
          .get(`/articles/?query=${query}&author=${author}`)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            done();
          });
      });
  
    });

    describe("POST /artice", () => {
        it("should do post an article", (done) => {
            chai.request(url)
              .post('/articles')
              .send({
                  author_id: 2,
                  title: "Testing Article Title",
                  body: "This is article body for testing."
              })
              .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                done();
              });
          });
    })
  });
