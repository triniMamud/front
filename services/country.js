const pkg = require('../package');
const logger = require('nordic/logger');
const restclient = require('nordic/restclient')({
  timeout: 5000,
});

const log = logger(pkg.name);

const getCountryInfo = async (countryId, context) => {
  try {
    const { data } = await restclient.get(`/countries/${countryId}`, {
      cache: {
        maxAge: 86400, // cache from 24 hours
      },
      context,
    });

    return data;
  } catch (e) {
    log.error('Error on getCountryInfo', e);
    return null;
  }
};

module.exports = {
  getCountryInfo,
};
