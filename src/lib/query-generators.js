/* eslint max-params: "off" */
/* eslint max-statements: "off" */

import _ from "lodash";

import config from "config";
import queryShim from "lib/query-shim.js";


function isKeyDefined(path, wd) {
  var rv = true;
  path.forEach(function(k) {
    if(!wd[k]) {
      rv = false;
    }
    wd = wd[k];
  });
  return rv;
}

function hasTerms(path, d) {
  if(isKeyDefined(path, d)) {
    path.forEach(function(k) {
      d = d[k];
    });
    return Object.keys(d).length > 0;
  }
  return false;
}

export function bare_query(q, fields, sort, limit, offset, fields_exclude, term_type) {
  var query = queryShim(q, term_type);
  query["from"] = offset;
  query["size"] = limit;
  query["sort"] = sort;
  if(_.isArray(fields)) {
    if(_.isArray(fields_exclude)) {
      query["_source"] = {
        "include": fields,
        "exclude": fields_exclude
      };
    } else {
      query["_source"] = fields;
    }
  } else if(_.isArray(fields_exclude)) {
    query["_source"] = {
      "exclude": fields_exclude
    };
  }

  return query;
}

export function media_query(rq, mq, fields, sort, limit, offset, fields_exclude) {
  var rquery = queryShim(rq, "records");
  var query = bare_query(mq, fields, sort, limit, offset, fields_exclude, "mediarecords");

  var recordQuery = null;

  if(hasTerms(["query", "filtered", "filter"], rquery) || hasTerms(["query", "filtered", "query"], rquery)) {
    recordQuery = {
      "has_parent": {
        "parent_type": "records",
        "query": rquery["query"]
      }
    };
  }

  if(recordQuery) {
    if(hasTerms(["query", "filtered", "query"], query)) {
      query["query"]["filtered"]["query"] = {
        "bool": {
          "must": [
            recordQuery,
            query["query"]["filtered"]["query"]
          ]
        }
      };
    } else {
      query["query"]["filtered"]["query"] = recordQuery;
    }
  }


  if(!hasTerms(["query", "filtered", "query"], query)) {
    delete query["query"]["filtered"]["query"];
  }

  query["aggs"] = {
    "rs": {
      "terms": {
        "field": "recordset",
        "size": config.maxRecordsets
      }
    },
    "max_dm": {
      "max": {
        "field": "datemodified"
      }
    }
  };

  return query;
}

export function record_query(rq, fields, sort, limit, offset, fields_exclude) {
  var query = bare_query(rq, fields, sort, limit, offset, fields_exclude, "records");
  query["aggs"] = {
    "rs": {
      "terms": {
        "field": "recordset",
        "size": config.maxRecordsets
      }
    },
    "max_dm": {
      "max": {
        "field": "datemodified"
      }
    }
  };

  return query;
}
