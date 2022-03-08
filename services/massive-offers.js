/**
 * Modules dependencies
 */
const nordicConfig = require('nordic/config');
const FormData = require('form-data');
const restclient = require('./restclient')({
  timeout: 50000,
});

const { middleend } = nordicConfig.get('api');

const { handleErrorMessage } = require('../app/helpers/errorHandler');

const getForm = async (userId, config, params, context) => {
  const { siteId, version, url } = config;
  try {
    return await restclient.get(`${url(siteId)}/offers/batch`, {
      params: {
        version,
        user_id: userId,
        ...params,
      },
      context,
    });
  } catch (error) {
    return handleErrorMessage('Error in bringing massive offers form.', error);
  }
};

const uploadCsvFileMassive = async (csvFile, type, userId, config, context) => {
  const { scope, urlBatchApiMassive } = middleend;
  const { siteId } = config;
  try {
    const form = new FormData();
    form.append('file', csvFile.stream, csvFile.originalName);

    const { data } = await restclient.post(urlBatchApiMassive(`massive-operation/offer/${type}`), {
      headers: {
        'Content-Type': `multipart/form-data; boundary=${form.getBoundary()}`,
      },
      params: {
        ...(scope && { version: scope }),
        user_id: userId,
        site_id: siteId,
      },
      data: form,
      context,
    });
    return {
      type: data.status,
      message: data.message,
    };
  } catch (error) {
    return handleErrorMessage('Error on upload CSV File.', error);
  }
};

const getModalMassiveOffer = async (userId, config, params, context) => {
  const { siteId, version, url } = config;
  const { type } = params;
  try {
    return await restclient.get(`${url(siteId)}/offers/batch/success`, {
      params: {
        version,
        user_id: userId,
        site_id: siteId,
        offerType: type,
        ...params,
      },
      context,
    });
  } catch (error) {
    return handleErrorMessage('Error in bringing modal.', error);
  }
};

module.exports = {
  getForm,
  uploadCsvFileMassive,
  getModalMassiveOffer,
};
