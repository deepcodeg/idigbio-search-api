var should = require('chai').should();
var request = require('supertest');

var app = require('../app.js');
var config = app.config

describe('Home', function(){
  describe('index', function(){
    it('should contain v1', function(done){
      request(app.server)
        .get("/")
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(error, response) {
            response.body.should.have.property("v1"); 
            done();
        })
    }) 
    it('should contain v2', function(done){
      request(app.server)
        .get("/")
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(error, response) {
            response.body.should.have.property("v2"); 
            done();
        })
    }) 
  })
  describe('v2', function(){
    it('should contain view', function(done){
      request(app.server)
        .get("/v2")
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(error, response) {
            response.body.should.have.property("view");
            done();
        })
    })
    it('should contain search', function(done){
      request(app.server)
        .get("/v2")
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(error, response) {
            response.body.should.have.property("search");
            done();
        })
    }) 
    it('should contain mapping', function(done){
      request(app.server)
        .get("/v2")
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(error, response) {
            response.body.should.have.property("mapping"); 
            done();
        })
    }) 
  })
  describe('v1', function(){
    it('should contain records', function(done){
      request(app.server)
        .get("/v1")
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(error, response) {
            response.body.should.have.property("records");
            done();
        })
    })
    it('should contain mediarecords', function(done){
      request(app.server)
        .get("/v1")
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(error, response) {
            response.body.should.have.property("mediarecords");
            done();
        })
    }) 
    it('should contain recordsets', function(done){
      request(app.server)
        .get("/v1")
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(error, response) {
            response.body.should.have.property("recordsets"); 
            done();
        })
    })
    it('should contain publishers', function(done){
      request(app.server)
        .get("/v1")
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(error, response) {
            response.body.should.have.property("publishers"); 
            done();
        })
    })    
  })    
})