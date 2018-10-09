let chai = require('chai');
let expect = require('chai').expect;
let chaiHttp = require('chai-http');
let request = require('supertest');

chai.use(chaiHttp);

describe('API Halaman Utama testing', () => {
  it('Halaman utama lulus test', (done) => {
    chai.request('localhost:5432')
        .get('/')
        .end((err, res) => {
          expect(res.body).to.have.status(200);
        });
     done();
  });
});

describe('API http POST vote Testing', () => {
  it('API vote lulus testing', (done) => {
    chai.request('localhost:5432')
        .post('/vote')
        .end((err, res) => {
          expect(res.body).to.have.status(200);
        });
     done();
  });
});

describe('API data Testing', () => {
  it('testing API data berhasil', (done) => {
    chai.request('localhost:5432')
        .get('/data')
        .end((err, res) => {
          expect(res.body).to.have.status(200);
        });
     done();
  });
});