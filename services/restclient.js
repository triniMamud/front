/**
 * server-side config of restclient
 */
const env = require('nordic/env');
const nordicRestclient = require('nordic/restclient');

const restclient = (opts = {}) => {
  const restclientConfig = {
    ...opts,
  };

  if (env.ME_ENV === 'local') {
    restclientConfig.baseURL = 'http://localhost:8081';
    restclientConfig.retry = false;
  }

  return nordicRestclient(restclientConfig);
};

module.exports = restclient;
