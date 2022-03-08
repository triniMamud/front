const restclient = require('nordic/restclient')({
  timeout: 5000,
});

const getSite = async siteId => {
  try {
    const response = await restclient.get(`/sites/${siteId}`);

    return response.data;
  } catch (e) {
    if (e.response && e.response.status === 404) {
      return null;
    }

    throw e;
  }
};

/**
 * Expose Service
 */
module.exports = {
  getSite,
};
