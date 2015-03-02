"use strict";

var request = require('request');
var _ = require("lodash");

module.exports = function(app, config) {
    var loadRecordsets = require("../lib/load-recordsets.js")(app,config);

    return {
        // version:
        // http://idb-riak.acis.ufl.edu:8098/buckets/record_catalog/keys/0000012b-9bb8-42f4-ad3b-c958cb22ae45
        // http://idb-riak.acis.ufl.edu:8098/buckets/record/keys/0000012b-9bb8-42f4-ad3b-c958cb22ae45-14cdaa01e6581b4af8b5d544c9eaa2750b2eb4cf
        basic: function(req, res) {

            var t = req.params.t;
            var uuid = req.params.uuid;

            if (t == "media") {
                t = "mediarecords";
            }

            var query = {
                "query": { 
                    "term": {
                        "uuid": uuid
                    }
                }
            }

            request.post({
                url: config.search.server + config.search.index + t + "/_search",
                body: JSON.stringify(query)
            }, function (error, response, body) {
                body = JSON.parse(body);
                if (body.hits.hits.length > 0) {
                    body = body.hits.hits[0];
                    var indexterms = _.cloneDeep(body._source);
                    delete indexterms["data"];
                    var rb = {
                        "uuid": body._id,
                        "etag": body._source.data["idigbio:etag"],
                        "version": body._source.data["idigbio:version"],
                        "data": body._source.data["idigbio:data"],
                        "recordIds": body._source.data["idigbio:recordIds"],
                        "indexTerms": indexterms,
                        "attribution": {}
                    };

                    if (body._source.recordset){
                        var rs = {
                            "uuid": body._source.recordset
                        };
                        if (config.recordsets[body._source.recordset]) {
                            _.defaults(rs,config.recordsets[body._source.recordset]);
                            rb.attribution = rs;
                            res.json(rb);
                        } else {
                            loadRecordsets(function(){
                                _.defaults(rs,config.recordsets[body._source.recordset]);
                                rb.attribution = rs;
                                res.json(rb);
                            });
                        }
                    } else {
                        res.json(rb);
                    }
                } else {
                    res.status(404).json({
                        "error": "Not Found",
                        "statusCode": 404
                    });
                }
            });
        },        
    };
};