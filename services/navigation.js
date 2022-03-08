const buildRestClientContext = require('nordic/restclient/build-context');
const restclient = require('./restclient')({
  timeout: 50000,
});

const { log } = require('./logger');
const PromotionsService = require('./promotions');

const getMenuNavigation = async req => {
  const { siteId, version, url } = PromotionsService.getConfig(req);
  try {
    const { data } = await restclient.get(`${url(siteId)}/navigation`, {
      params: {
        version,
      },
      context: buildRestClientContext(req),
    });

    return data;
  } catch (error) {
    log.error('Error getting Pandora navigation');
    return error;
  }
};

module.exports = { getMenuNavigation };
