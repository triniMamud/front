const restclient = require('./restclient')({
  timeout: 50000,
});

const { handleErrorMessage } = require('../app/helpers/errorHandler');

/**
 * Retrieve the offers list.
 * @returns {Object} The data of the page
 */
const getOffersList = async (promotionId, userId, config, params, context) => {
  const { siteId, version, url } = config;

  try {
    return await restclient.get(`${url(siteId)}/${promotionId}/offers`, {
      params: {
        version,
        user_id: userId,
        ...params,
      },
      context,
    });
  } catch (error) {
    return handleErrorMessage('Error on get offers middleEnd service', error);
  }
};

const validateItem = async (body, config, promotionId, userId, context) => {
  const { version, url } = config;

  try {
    return await restclient.post(`${url(body.siteId)}/${promotionId}/items/validate`, {
      params: {
        version,
        userId,
      },
      data: {
        item_id: body.itemId,
        promotion_id: promotionId,
      },
      context,
    });
  } catch (error) {
    return handleErrorMessage('Error on validate item middleEnd service', error);
  }
};

const getOfferEditForm = async (promotionId, offerId, userId, config, context) => {
  const { siteId, version, url } = config;

  try {
    return await restclient.get(`${url(siteId)}/${promotionId}/offers/${offerId}`, {
      params: {
        version,
        userId,
      },
      context,
    });
  } catch (error) {
    return handleErrorMessage('Error on edit offer middleEnd service', error);
  }
};

const addOffer = async (body, config, promotionId, userId, context) => {
  const { version, url } = config;

  try {
    const data = {
      promotion_id: promotionId,
      item_id: body.itemId,
      new_price: body.finalPrice,
      rebate_meli_amount: body.rebatePrice,
      si_max: body.rebatePrice ? body.siMax : null,
      start_date: body.startDate,
      end_date: body.endDate,
    };

    return await restclient.post(`${url(body.siteId)}/${promotionId}/offers`, {
      params: {
        version,
        userId,
      },
      data,
      context,
    });
  } catch (error) {
    return handleErrorMessage('Error on add offer middleEnd service', error);
  }
};

const editOffer = async (body, config, promotionId, offerId, userId, context) => {
  const { version, url } = config;

  try {
    const data = {
      new_price: body.finalPrice,
      rebate_meli_amount: body.rebatePrice,
      si_max: body.rebatePrice ? body.siMax : null,
    };

    return await restclient.put(`${url(body.siteId)}/${promotionId}/offers/${offerId}`, {
      params: {
        version,
        userId,
      },
      data,
      context,
    });
  } catch (error) {
    return handleErrorMessage('Error on edit offer middleEnd service', error);
  }
};

const deleteOffer = async (promotionId, offerId, userId, config, context) => {
  const { siteId, version, url } = config;

  try {
    return await restclient.delete(`${url(siteId)}/${promotionId}/offers/${offerId}`, {
      params: {
        version,
        userId,
      },
      context,
    });
  } catch (error) {
    return handleErrorMessage('Error on delete offer middleEnd service', error);
  }
};

const approveOffer = async (promotionId, offerId, userId, config, context) => {
  const { siteId, version, url } = config;

  try {
    return await restclient.post(`${url(siteId)}/${promotionId}/offers/${offerId}/approve`, {
      params: {
        version,
        userId,
      },
      context,
    });
  } catch (error) {
    return handleErrorMessage('Error on approve offer middleEnd service', error);
  }
};

module.exports = {
  addOffer,
  approveOffer,
  deleteOffer,
  editOffer,
  getOfferEditForm,
  getOffersList,
  validateItem,
};
