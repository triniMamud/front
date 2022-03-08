const pkg = require('../package');
const logger = require('nordic/logger');
const restclient = require('nordic/restclient')({
  timeout: 5000,
});

const log = logger(pkg.name);

const getCurrencyInfo = async (currencyId, context) => {
  try {
    const { data } = await restclient.get(`/currencies/${currencyId}`, {
      cache: {
        maxAge: 86400, // cache from 24 hours
      },
      context,
    });

    return data;
  } catch (e) {
    log.error('Error on getCurrencyInfo', e);
    return null;
  }
};

module.exports = {
  getCurrencyInfo,
};
