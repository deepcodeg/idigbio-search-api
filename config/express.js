var express = require('express');
var cors = require('cors');

var bodyParser = require('body-parser');

module.exports = function(app, config) {
    app.use(cors());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json({
        type: function(req){
            return true;
        }
    }));
    // app.all('*', function(req, res, next) {
    //     res.header("Access-Control-Allow-Origin", "*");
    //     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    //     next();
    // });    
}