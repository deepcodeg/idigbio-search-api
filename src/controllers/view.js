import _ from 'lodash';

import config from "config";
import api from "api";
import searchShim from "searchShim.js";
import {get as getRecordset} from "lib/recordsets";

export async function basic(ctx, next) {
  const uuid = ctx.params.uuid;
  let t = ctx.params.t || "_all";
  if(t === "media") { t = "mediarecords"; }

  const query = {
    "query": {
      "term": {
        "uuid": uuid
      }
    }
  };
  const statsInfo = {
    type: "view",
    recordtype: t,
    ip: ctx.ip,
  };
  let body = await searchShim(config.search.index, t, "_search", query, statsInfo);
  if(body.hits.hits.length > 0) {
    body = body.hits.hits[0];
    var indexterms = _.cloneDeep(body._source);
    delete indexterms["data"];
    var rb = ctx.body = {
      "uuid": body._id,
      "type": body._type,
      "etag": body._source.etag,
      "version": body._source.version,
      "data": body._source.data,
      "recordIds": body._source.recordIds,
      "indexTerms": indexterms,
      "attribution": {}
    };
    const rsid = body._source.recordset;
    if(rsid) {
      try {
        rb.attribution = await getRecordset(rsid);
      } catch (e) {
        console.error("Failed finding recordset", e);
        rb.attribution = { "uuid": rsid };
      }
    }
    ctx.body = rb;
  } else {
    ctx.throw(404);
  }
}

api.get('/v2/view/:t?/:uuid', basic);
