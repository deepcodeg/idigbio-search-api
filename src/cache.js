import _ from "lodash";
import cacheManager from "cache-manager";
import redisStore from "cache-manager-redis";

import config from "config";
import {getLastModified} from "lib/lastModified";

const memoryCache = cacheManager.caching({
  store: 'memory',
  max: 128,
  ttl: 600
});

let cache = null;

if(config.ENV !== 'test') {
  const redisCache = cacheManager.caching(_.defaults({
    store: redisStore,
    db: 1,
    ttl: 3600,
    compress: true
  }, config.redis));
  cache = cacheManager.multiCaching([memoryCache, redisCache]);
} else {
  cache = memoryCache;
}

const version = process.env.npm_package_version; /* eslint no-process-env: 0 */

/**
 * call this with a base key and it will improve it with the current
 * software version and lastmodified date for better cache busting.
 */
function improveKey(k) {
  k += ":" + version;
  const lm = getLastModified();
  if(lm) { k += ":" + lm.getTime(); }
  return k;
}

export default {
  cache,
  improveKey,

  wrap(k, ...args) { return this.cache.wrap(this.improveKey(k), ...args); },

};
