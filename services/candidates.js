/**
 * Modules dependencies
 */
const restclient = require('./restclient')({
  timeout: 10000,
});

const { handleErrorMessage } = require('../app/helpers/errorHandler');

/**
 * Retrieve the items candidates list.
 * @returns {Object} The data of the page
 */
const getItemsOfferList = async (promotionId, userId, config, params, context) => {
  const { siteId, version, url } = config;

  try {
    return await restclient.get(`${url(siteId)}/${promotionId}/candidates/items`, {
      params: {
        version,
        user_id: userId,
        ...params,
      },
      context,
    });
  } catch (error) {
    return handleErrorMessage('Error getting items candidates from middleEnd service.', error);
  }
};

/**
 * Retrieve the invalid items candidates list.
 * @returns {Object} The data of the page
 */
const getItemsList = async (promotionId, userId, config, params, context) => {
  const { siteId, version, url } = config;
  try {
    return await restclient.get(`${url(siteId)}/${promotionId}/candidates/invalid`, {
      params: {
        version,
        user_id: userId,
        ...params,
      },
      context,
    });
  } catch (error) {
    return handleErrorMessage('Error getting items candidates from middleEnd service.', error);
  }
};

module.exports = {
  getItemsOfferList,
  getItemsList,
};
