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

const getConfig = ({ query: { siteId }, cookies: { cookieSiteId, meliLab } }, defaultSiteId) => ({
  version: meliLab || middleend?.scope,
  siteId: defaultSiteId || siteId || cookieSiteId || 'MLA',
  url: middleend.url,
});

/**
 * Retrieve the list of promotions.
 * @returns {Object} The data of the page
 */
const list = async (params, config, context, roles) => {
  const { siteId, version, url } = config;
  if (roles && roles.includes('SP_CENTRAL_TIERS') && roles.filter(r => r.includes('SP_CENTRAL')).length === 1) {
    params.type = 'tiers';
  }
  try {
    const { data } = await restclient.get(`${url(siteId)}/list`, {
      params: {
        version,
        ...params,
      },
      context,
    });

    return data;
  } catch (error) {
    return handleErrorMessage('Error on list', error);
  }
};

/**
 * Retrieve the first data to show the promotion builder.
 * @param {String} promotionId - Id of promotion, cannot be null
 * @param {String} userId - Id of administrator user, cannot be null
 * @param {Object} config - Context config params
 * @returns {Object} The data of the builder
 */
const getBuilder = async (userId, config, promotionId = null, context) => {
  const { siteId, version, url } = config;

  try {
    const params = {
      params: {
        version,
        userId,
      },
      context,
    };

    const urlBuilder = promotionId ? `${url(siteId)}/${promotionId}` : url(siteId);

    const { data } = await restclient.get(urlBuilder, params);

    return data;
  } catch (error) {
    return handleErrorMessage('Error on getBuilder', error);
  }
};

/**
 * Saves the data of current promotion
 * @param {String} body - contains the data of the steps, user and promotion.
 * @param {String} userId - Id of administrator user, cannot be null
 * @param {Object} config - Context config params
 * @param {String} sessionId - ldap session for the logged in user, cannot be null
 * @param {Object} contex - melicontext object, cannot be null
 */
const submitEditForm = async (body, userId, config, sessionId, context) => {
  const { userData, promotionId } = body;
  const { siteId, version, url } = config;

  try {
    const params = {
      params: {
        version,
        userId,
        session_id: sessionId,
      },
      data: {
        user_id: userId,
        data: {
          ...userData,
          site: siteId,
        },
      },
      context,
    };

    const { data } = await restclient.put(`${url(siteId)}/${promotionId}/edit`, params);
    return data;
  } catch (error) {
    return handleErrorMessage('Error on submitEditForm', error);
  }
};

/**
 * Get the details of the promotion Id.
 * @param {String} actionId - id of requested action
 * @param {Object} body - body of request
 * @param {String} promotionId - id of promotion
 * @param {String} userId - id of user
 * @param {Object} config - Context config params
 */
const getActionModal = async (params, body, promotionId, userId, config, context) => {
  const { siteId, version, url } = config;

  const { actionId } = params;

  try {
    return await restclient.post(`${url(siteId)}/${promotionId}/action/${actionId}`, {
      params: {
        version,
        userId,
      },
      data: body,
      context,
    });
  } catch (error) {
    return handleErrorMessage('Error on get the action modal on middleEnd service', error);
  }
};

/**
 * Start the simulation of marketplace and killers campaigns.
 * @param {String} promotionId - id of promotion
 * @param {Object} body - data from me
 * @param {String} userId - id of user
 * @param {Object} config - Context config params
 */
const simulateCampaign = async (promotionId, body, userId, config, context) => {
  const { siteId, version, url } = config;

  try {
    return await restclient.post(`${url(siteId)}/${promotionId}/simulate`, {
      params: {
        version,
        ...body,
        userId,
      },
      context,
    });
  } catch (error) {
    return handleErrorMessage('Error on start the simulation of this promotion on middleEnd service', error);
  }
};

/**
 * Approve or Reject a promotion.
 * @param {String} body - contains the data of promotion
 * @param {String} action - id of required action
 * @param {String} userId - id of user
 * @param {String} roles - roles of user
 * @param {Object} config - Context config params
 */
const approveRejectPromotion = async (body, action, userId, config, roles, context) => {
  const { promotionId } = body;
  const { siteId, version, url } = config;

  try {
    const params = {
      params: {
        version,
        userId,
      },
      data: {
        performer: userId,
        updated_by: userId,
        action,
        roles,
      },
      context,
    };

    return await restclient.post(`${url(siteId)}/${promotionId}/status`, params);
  } catch (error) {
    return handleErrorMessage('Error on middleEnd service', error);
  }
};

/**
 * Update the status of a promotion.
 * @param {String} body - contains the data of the steps, user and promotion.
 * @param {String} action - id of required action
 * @param {String} userId - id of user
 * @param {String} roles - roles of user
 * @param {Object} config - Context config params
 */
const updateStatus = async (body, action, userId, config, roles, context) => {
  const { reason, promotionId } = body;
  const { siteId, version, url } = config;

  try {
    const params = {
      params: {
        version,
        userId,
      },
      data: {
        action,
        reason,
        performer: userId,
        updated_by: userId,
        roles,
      },
      context,
    };

    return await restclient.post(`${url(siteId)}/${promotionId}/status`, params);
  } catch (error) {
    return handleErrorMessage('Error updating the promotion status on middleEnd service', error);
  }
};

/**
 * Upload the CSV to Batch API.
 */
const uploadCsvFile = async (csvFile, promotionId, userId, context) => {
  const { scope, urlBatchApi } = middleend;

  try {
    const form = new FormData();
    form.append('file', csvFile.stream, csvFile.originalName);

    const { data } = await restclient.post(urlBatchApi('pre-negotiated/process'), {
      headers: {
        'Content-Type': `multipart/form-data; boundary=${form.getBoundary()}`,
      },
      params: {
        ...(scope && { version: scope }),
        user_id: userId,
        promotion_id: promotionId,
        type: 'PRE_NEGOTIATED',
      },
      data: form,
      context,
    });

    return {
      type: 'success',
      message: `Te avisaremos cuando terminemos de procesar tu archivo csv. Batch #${data.batch_id}.`,
    };
  } catch (error) {
    return handleErrorMessage('Error on upload CSV File', error);
  }
};

/**
 * Upload the CSV of Requirements to Batch API.
 */
const uploadCsvFileRequirements = async (csvFile, userId, promotionId, type, context) => {
  const { scope, urlBatchApi } = middleend;
  try {
    const form = new FormData();
    form.append('file', csvFile.stream, csvFile.originalName);
    const { data } = await restclient.post(urlBatchApi('precondition/process'), {
      headers: {
        'Content-Type': `multipart/form-data; boundary=${form.getBoundary()}`,
      },
      params: {
        ...(scope && { version: scope }),
        user_id: userId,
        promotion_id: promotionId,
        type,
      },
      data: form,
      context,
    });
    return data;
  } catch (error) {
    return handleErrorMessage('Error on upload CSV File', error);
  }
};

/**
 * Delete CSV of Requirements from Batch API.
 */
const uploadItemsFileRequirements = async (userId, promotionId, type, fileId, context) => {
  const { scope, urlBatchApi } = middleend;
  try {
    const { data } = await restclient.delete(urlBatchApi(`precondition/${fileId}`), {
      params: {
        ...(scope && { version: scope }),
        user_id: userId,
        promotion_id: promotionId,
        type,
      },
      context,
    });
    return data;
  } catch (error) {
    return handleErrorMessage('Error on delete CSV File', error);
  }
};

/**
 * Update the status of a promotion.
 * @param {String} body - contains the data of the steps, user and promotion.
 * @param {String} apiUrl - url of ME.
 * @param {String} userId - id of user
 * @param {Object} config - Context config params
 */
const put = async (body, apiUrl, userId, config, context) => {
  const { siteId, version, url } = config;

  try {
    const params = {
      params: {
        version,
        user_id: userId,
      },
      data: body,
      context,
    };
    return await restclient.put(`${url(siteId)}/${apiUrl}`, params);
  } catch (error) {
    return handleErrorMessage('Error updating the offers status on middleEnd service', error);
  }
};

/**
 * Add an offer
 * @param {String} body - contains the data of the steps, user and promotion.
 * @param {String} apiUrl - url of ME.
 * @param {String} userId - id of user
 * @param {Object} config - Context config params
 */
const post = async (body, apiUrl, userId, config, context) => {
  const { siteId, version, url } = config;

  try {
    const { data } = await restclient.post(`${url(siteId)}/${apiUrl}`, {
      params: {
        version,
        user_id: userId,
        siteId,
      },
      data: body,
      context,
    });
    return data;
  } catch (error) {
    return handleErrorMessage('Error adding offer on middleEnd service', error);
  }
};

/**
 * Retrieve the template of csv.
 * @returns {Object} The csv template
 */
const csvTemplate = async (siteId, context) => {
  const { scope, urlBatchApi } = middleend;

  try {
    const { data, headers } = await restclient.get(urlBatchApi('templates/pre-negotiated'), {
      params: {
        ...(scope && { version: scope }),
        site_id: siteId,
      },
      context,
      responseType: 'stream',
    });

    // Get the content-disposition header value.
    const contentDisposition = headers['content-disposition'];

    return {
      data,
      contentDisposition,
    };
  } catch (error) {
    return handleErrorMessage('Error getting the template', error);
  }
};

/**
 * Retrieve the new builder of promotions.
 * @returns {Object} The data of the page
 */
const creatorFlow = async (params, config, context, body = {}) => {
  const { sessionId, userId, id, currentStep } = params;
  const { siteId, version, url } = config;
  const current = currentStep == null ? '' : `/${currentStep}`;

  try {
    const { data } = await restclient.post(`${url(siteId)}/create${current}`, {
      params: {
        version,
        ...params,
        session_id: sessionId,
        user_id: userId,
        promotion_id: id,
      },
      data: body,
      context,
    });
    return data;
  } catch (error) {
    return handleErrorMessage('Error on creator', error);
  }
};

/**
 * Execute an specific action for a promotion
 * @returns {Object} The data of the response
 */
const executeAction = async (params, config, context) => {
  const { id, sessionId, userId, action_id: actionId } = params;
  const { siteId, version, url } = config;

  try {
    const { data } = await restclient.put(`${url(siteId)}/${id}/execute/${actionId}`, {
      params: {
        version,
        session_id: sessionId,
        user_id: userId,
      },
      context,
    });
    return data;
  } catch (error) {
    return handleErrorMessage('Error on execute action', error);
  }
};

/**
 * Execute an specific action for a promotion
 * @returns {Object} The data of the response
 */
const getPromotion = async (params, config, context) => {
  const { sessionId, userId, promotionId, actionId } = params;
  const { siteId, version, url } = config;
  try {
    const { data } = await restclient.get(`${url(siteId)}/duplicate`, {
      params: {
        version,
        session_id: sessionId,
        user_id: userId,
      },
      data: {
        promotion_id: promotionId,
        action_id: actionId,
      },
      context,
    });
    return data;
  } catch (error) {
    return handleErrorMessage('Error on execute duplicate action', error);
  }
};

/**
 * Send promotion's data to duplicated it
 * @returns {Object} The data of the response
 */
const duplicateCampaign = async (params, config, context) => {
  const { sessionId, userId, promotion, promotionId } = params;
  const { siteId, version, url } = config;
  try {
    const { data } = await restclient.post(`${url(siteId)}/${promotionId}/duplicate`, {
      params: {
        version,
        session_id: sessionId,
        user_id: userId,
      },
      data: {
        promotion,
      },
      context,
    });
    return data;
  } catch (error) {
    return handleErrorMessage('Error on duplicate campaign', error);
  }
};

/**
 * Expose Service
 */
module.exports = {
  approveRejectPromotion,
  csvTemplate,
  getActionModal,
  getBuilder,
  list,
  post,
  put,
  simulateCampaign,
  submitEditForm,
  updateStatus,
  uploadCsvFile,
  uploadCsvFileRequirements,
  uploadItemsFileRequirements,
  creatorFlow,
  executeAction,
  getConfig,
  getPromotion,
  duplicateCampaign,
};
