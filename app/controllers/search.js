"use strict";

var request = require('request');
var _ = require('lodash');

module.exports = function(app, config) {   
    var formatter = require("../lib/formatter.js")(app,config);
    var cp = require("../lib/common-params.js")(app,config);
    var qg = require("../lib/query-generators.js")(app,config);

    var required_fields = ["data.idigbio:version", "data.idigbio:etag", "data.idigbio:recordIds"];

    return {
        media: function(req, res) {

            var mq = cp.query("mq", req);

            var rq = cp.query("rq", req);

            var limit = cp.limit(req);

            var offset = cp.offset(req);

            var sort = cp.sort(req);

            var fields = cp.fields(req);
            if (_.isArray(fields)) {
                fields.push.apply(fields,required_fields);
            }

            var query = qg.media_query(rq,mq,fields,sort,limit,offset)

            request.post({
                url: config.search.server + config.search.index + "mediarecords/_search",
                body: JSON.stringify(query)
            },function (error, response, body) {
                formatter.basic(body,res);
            });
        },

        basic: function(req, res) {

            var rq = cp.query("rq", req);

            var limit = cp.limit(req);

            var offset = cp.offset(req);

            var sort = cp.sort(req);

            var fields = cp.fields(req);
            if (_.isArray(fields)) {
                fields.push.apply(fields,required_fields);
            }

            var query = qg.record_query(rq,fields,sort,limit,offset)

            request.post({
                url: config.search.server + config.search.index + "records/_search",
                body: JSON.stringify(query)
            },function (error, response, body) {
                formatter.basic(body,res);
            });
        },
    };
};