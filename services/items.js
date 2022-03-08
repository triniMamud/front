/**
 * Modules dependencies
 */
const nordicConfig = require('nordic/config');
const restclient = require('./restclient')({
  timeout: 10000,
});

const { middleend } = nordicConfig.get('api');

const { handleErrorMessage } = require('../app/helpers/errorHandler');

/**
 * Retrieve the data from item to search.
 * @returns {Object} The data of item history
 */
const getItemData = async (userId, config, params, context) => {
  const { siteId, version, url } = config;
  const { search } = params;
  try {
    return await restclient.get(`${url(siteId)}`, {
      params: {
        version,
        user_id: userId,
        ...params,
      },
      data: {
        item_id: search,
      },
      context,
    });
  } catch (error) {
    return handleErrorMessage('Error in bringing item.', error);
  }
};

const getConfig = ({ query: { siteId }, cookies: { cookieSiteId, meliLab } }, defaultSiteId) => ({
  version: meliLab || middleend?.scope,
  siteId: defaultSiteId || siteId || cookieSiteId || 'MLA',
  url: middleend.urlItems,
});

module.exports = {
  getItemData,
  getConfig,
};
