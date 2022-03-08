const env = require('nordic/env');

module.exports = {
  api: {
    internal: {
      baseUrl: 'http://internal-api.mercadolibre.com',
    },
    middleend: {
      url: siteId =>
        env.ME_ENV === 'local'
          ? `/sites/${siteId}/promotions`
          : `/seller-promotions/admin-middleend/sites/${siteId}/promotions`,
      urlBatchApi: path => `/seller-promotions/batch/files/${path}`,
      urlBatchApiMassive: path => `/seller-promotions/batch/${path}`,
      urlItems: siteId =>
        env.ME_ENV === 'local' ? `/sites/${siteId}/items` : `/seller-promotions/admin-middleend/sites/${siteId}/items`,
      urlCredibilityExceptions: siteId => env.ME_ENV === 'local' ? `/sites/${siteId}/credibility_whitelist`:
        `/seller-promotions/admin-middleend/sites/${siteId}/credibility_whitelist`,
        scope: 'test',
    },
  },
  backToPreviousAdmin: true,
  hotReload: {
    enabled: true,
  },
};
