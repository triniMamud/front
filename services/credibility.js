/**
 * Modules dependencies
 */
const nordicConfig = require('nordic/config');
const FormData = require('form-data');

const restclient = require('./restclient')({
  timeout: 10000,
});

const { middleend } = nordicConfig.get('api');

const { handleErrorMessage } = require('../app/helpers/errorHandler');

/**
 * Retrieve the data from item to search.
 * @returns {Object} The data of item history
 */
const getForm = async (userId, config, params, context) => {
  const { siteId, version, url } = config;
  try {
    return await restclient.get(`${url(siteId)}`, {
      params: {
        version,
        user_id: userId,
        ...params,
      },
      context,
    });
  } catch (error) {
    return handleErrorMessage('Error in bringing credibility whitelist form.', error);
  }
};

const uploadCsvFileCredibility = async (csvFile, userId, context) => {
  const { scope, urlBatchApi } = middleend;
  try {
    const form = new FormData();
    form.append('file', csvFile.stream, csvFile.originalName);
    const { data } = await restclient.post(urlBatchApi('/credibility-item-whitelist/process'), {
      headers: {
        'Content-Type': `multipart/form-data; boundary=${form.getBoundary()}`,
      },
      params: {
        ...(scope && { version: scope }),
        user_id: userId,
        type: 'CREDIBILITY_ITEM_WL',
      },
      data: form,
      context,
    });
    return {
      type: data.status,
      message: data.message,
    };
  } catch (error) {
    return handleErrorMessage('Error on upload CSV File', error);
  }
};

const getConfig = ({ query: { siteId }, cookies: { cookieSiteId, meliLab } }, defaultSiteId) => ({
  version: meliLab || middleend?.scope,
  siteId: defaultSiteId || siteId || cookieSiteId,
  url: middleend.urlCredibilityExceptions,
});

module.exports = {
  getForm,
  getConfig,
  uploadCsvFileCredibility,
};
