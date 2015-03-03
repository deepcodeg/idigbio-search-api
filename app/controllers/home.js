"use strict";

var request = require('request');

module.exports = function(app, config) {

    function getSubKeys(mappingDict, fnPrefix) {
        var rv = {};
        var props = mappingDict["properties"];
        Object.keys(props).forEach(function(key){
            if (props[key].type) {
                var typ = props[key].type;
                // Can't decide if notifying of analyzer status is a good thing or not.
                // if (props[key].analyzer && props[key].analyzer === "keyword") {
                //     typ = "keyword";
                // }
                rv[key] = {
                    type: typ,
                    fieldName: fnPrefix + key
                };
            } else if (props[key].properties) {
                rv[key] = getSubKeys(props[key], fnPrefix + key + ".");
            }
        });
        return rv;
    }

    return {
        index: function(req, res, next) {
            res.json({
                'v1': req.protocol + '://' + req.get("host") + '/v1',
                'v2': req.protocol + '://' + req.get("host") + '/v2',
            });
            next();
        },
        v2: function(req, res, next) {
            res.json({
                'search': req.protocol + '://' + req.get("host") + '/v2/search',
                'mapping': req.protocol + '://' + req.get("host") + '/v2/mapping',
                'view': req.protocol + '://' + req.get("host") + '/v2/view',
            });
            next();
        },
        v1: function(req, res, next) {
            //console.log("http://api.idigbio.org" + req.originalUrl)
            request.get("http://api.idigbio.org" + req.originalUrl,function(error, response, body) {
                res.json(JSON.parse(body));
                next();
            });
        },
        searchProxy: function(req, res, next) {
            //console.log(config.search.server + req.originalUrl)
            request.get(config.search.server + req.originalUrl,function(error, response, body) {
                res.json(JSON.parse(body));
                next();
            });
        },
        searchProxyPost: function(req, res, next) {
            // Fix broken decode on missing mime type
            if (Object.keys(req.body).length === 1 && req.body[Object.keys(req.body)[0]] === '' ){
                try {
                    req.body = JSON.parse(Object.keys(req.body)[0]);
                } catch(e) {
                    res.status(400).json({"error": "Bad Request"});
                    next();
                    return;
                }
            }

            request.post({
                url: config.search.server + req.originalUrl,
                body: JSON.stringify(req.body)
            },function(error, response, body) {
                res.json(JSON.parse(body));
                next();
            });
        },
        indexFields: function(req, res, next) {
            var t = req.params.t;

            if (t == "media") {
                t = "mediarecords";
            }

            request.get(config.search.server + "/idigbio/" + t + "/_mapping",function(error, response, body) {
                var mapping = JSON.parse(body);
                var resp = {};
                Object.keys(mapping).forEach(function(index){
                    resp = getSubKeys(mapping[index]["mappings"][t], "");
                });
                res.json(resp);
                next();
            });
        }
    };
};