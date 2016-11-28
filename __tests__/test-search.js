import {expect, should} from 'chai';  // eslint-disable-line no-unused-vars
should();
import request from 'supertest-as-promised';

import config from "config";

import redisMock from "redis-mock";
jest.mock('redis', () => redisMock);
import app from "app";

describe('Search', function() {
  let server = null;
  beforeAll(() => { server = app.listen(); });
  afterAll(() => server.close());

//  jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;

  describe('basicGET', function() {
    it('should return an empty search for {"scientificname": "nullius nullius"}', async function() {
      var q = {"scientificname": "nullius nullius"};
      const response = await request(server)
            .get("/v2/search/records/")
            .query({rq: JSON.stringify(q)})
            .expect('Content-Type', /json/)
            .expect(200);

      response.body.itemCount.should.equal(0);
      response.body.items.length.should.equal(0);

    });
    it('should not return an empty search for {}', async function() {
      var q = {};
      const response = await request(server)
            .get("/v2/search/records/")
            .query({rq: JSON.stringify(q), limit: 10})
            .expect('Content-Type', /json/)
            .expect(200);
      response.body.itemCount.should.not.equal(0);
      response.body.items.length.should.not.equal(0);
    });
    it('should be able to return a limited set of fields', async function() {
      var q = {"scientificname": {"type": "exists"}, "genus": "carex"};
      const response = await request(server)
            .get("/v2/search/records/")
            .query({limit: 10, fields: ["scientificname"], rq: JSON.stringify(q)})
            .expect('Content-Type', /json/)
            .expect(200);
      response.body.items[0].indexTerms.should.have.property("scientificname");
      Object.keys(response.body.items[0].indexTerms).length.should.equal(1);
    });
    it('should obey maxLimit', async function() {
      var q = {};
      const response = await request(server)
            .get("/v2/search/records/")
            .query({rq: JSON.stringify(q), limit: 10000, fields: ["uuid"]})
            .expect('Content-Type', /json/)
            .expect(200);
      response.body.items.length.should.be.below(config.maxLimit + 1);
    });
  });
  describe('basicPOST', function() {
    it('should return an empty search for {"scientificname": "nullius nullius"}', async function() {
      var q = {"scientificname": "nullius nullius"};
      const response = await request(server)
            .post("/v2/search/records/")
            .send({rq: q})
            .expect('Content-Type', /json/)
            .expect(200);
      response.body.itemCount.should.equal(0);
      response.body.items.length.should.equal(0);

    });
    it('should not return an empty search for {}', async function() {
      var q = {};
      const response = await request(server)
            .post("/v2/search/records/")
            .send({
              rq: q,
              limit: 10,
            })
            .expect('Content-Type', /json/)
            .expect(200);
      response.body.itemCount.should.not.equal(0);
      response.body.items.length.should.not.equal(0);

    });
    it('should be able to return a limited set of fields', async function() {
      var q = {"scientificname": {"type": "exists"}, "genus": "carex"};
      const response = await request(server)
            .post("/v2/search/records/")
            .send({
              rq: q,
              limit: 10,
              fields: ["scientificname"]
            })
            .expect('Content-Type', /json/)
            .expect(200);
      response.body.items[0].indexTerms.should.have.property("scientificname");
      Object.keys(response.body.items[0].indexTerms).length.should.equal(1);
    });
    it('should obey maxLimit', async function() {
      var q = {};
      const response = await request(server)
            .post("/v2/search/records/")
            .send({
              rq: q,
              limit: 10000,
              fields: ["uuid"]
            })
            .expect('Content-Type', /json/)
            .expect(200);
      response.body.items.length.should.be.below(config.maxLimit + 1);
    });
    it('should support multiple field sorting with an array', async function() {
      var q = {"family": "asteraceae"}, s = [{"genus": "desc"}, {"specificepithet": "asc"}];
      const response = await request(server)
            .post("/v2/search/records/")
            .send({
              rq: q,
              sort: s,
              limit: 10,
            })
            .expect('Content-Type', /json/)
        .expect(200);
      response.body.itemCount.should.not.equal(0);
      response.body.items.length.should.not.equal(0);
    });
    it('should support sorting with a single field name string', async function() {
      var q = {"family": "asteraceae"}, s = "genus";
      const response = await request(server)
            .post("/v2/search/records/")
            .send({
              rq: q,
              sort: s,
              limit: 10,
            })
            .expect('Content-Type', /json/)
            .expect(200);
      response.body.itemCount.should.not.equal(0);
      response.body.items.length.should.not.equal(0);
    });
  });

  describe('mediaGET', function() {
    it('should return an empty search for {"type": "null"}', async function() {
      var q = {"type": "null"};
      const response = await request(server)
            .get("/v2/search/media/")
            .query({rq: JSON.stringify({})})
            .query({mq: JSON.stringify(q)})
            .expect('Content-Type', /json/)
            .expect(200);
      response.body.itemCount.should.equal(0);
      response.body.items.length.should.equal(0);
    });
    it('should not return an empty search for {}', async function() {
      var q = {};
      const response = await request(server)
            .get("/v2/search/media/?limit=10")
            .query({limit: 10, rq: JSON.stringify({}), mq: JSON.stringify(q)})
            .expect('Content-Type', /json/)
            .expect(200);
      response.body.itemCount.should.not.equal(0);
      response.body.items.length.should.not.equal(0);
    });
    it('should be able to return a limited set of fields', async function() {
      var q = { "data.ac:accessURI": {"type": "exists"} };
      const response = await request(server)
            .get("/v2/search/media/")
            .query({limit: 10})
            .query({fields: '["data.ac:accessURI"]'})
            .query({mq: JSON.stringify(q)})
            .expect('Content-Type', /json/)
            .expect(200);
      response.body.items[0].data.should.have.property("ac:accessURI");
      Object.keys(response.body.items[0].data).length.should.equal(1);
    });
    it('should obey maxLimit', async function() {
      var q = {};
      const response = await request(server)
            .get("/v2/search/media/")
            .query({limit: 10000, rq: JSON.stringify({}), mq: JSON.stringify(q), fields: ["uuid"]})
            .expect('Content-Type', /json/)
            .expect(200);
      response.body.items.length.should.be.below(config.maxLimit + 1);
    });
  });
  describe('mediaPOST', function() {
    it('should return an empty search for {"type": "null"}', async function() {
      var q = {"type": "null"};
      const response = await request(server)
            .post("/v2/search/media/")
            .send({
              rq: {},
              mq: q
            })
            .expect('Content-Type', /json/)
            .expect(200);
      response.body.itemCount.should.equal(0);
      response.body.items.length.should.equal(0);
    });
    it('should not return an empty search for {}', async function() {
      var q = {};
      const response = await request(server)
            .post("/v2/search/media/")
            .send({
              rq: {},
              mq: q,
              limit: 10,
            })
            .expect('Content-Type', /json/)
            .expect(200);
      response.body.itemCount.should.not.equal(0);
      response.body.items.length.should.not.equal(0);
    });
    it('should be able to return a limited set of fields', async function() {
      var q = { "data.ac:accessURI": {"type": "exists"} };
      const response = await request(server)
            .post("/v2/search/media/")
            .send({
              mq: q,
              limit: 10,
              fields: ["data.ac:accessURI"]
            })
            .expect('Content-Type', /json/)
            .expect(200);
      response.body.items[0].data.should.have.property("ac:accessURI");
      Object.keys(response.body.items[0].data).length.should.equal(1);
    });
    it('should obey maxLimit', async function() {
      var q = {};
      const response = await request(server)
            .post("/v2/search/media/")
            .send({
              rq: {},
              mq: q,
              limit: 10000,
              fields: ["data.ac:accessURI"]
            })
            .expect('Content-Type', /json/)
            .expect(200);
      response.body.items.length.should.be.below(config.maxLimit + 1);
    });
  });
});
