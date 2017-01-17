/* eslint no-process-env: "off" */

import KoaRouter from 'koa-router';

import config from 'config';

const api = KoaRouter();

api.get('/healthz', function(ctx) {
  ctx.body = {
    ENV: config.ENV,
    path: ctx.originalUrl,
    version: process.env.npm_package_version
  };
});

export default api;
