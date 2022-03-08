const pkg = require('../package.json');

const { APPLICATION } = process.env;

module.exports = {
  api: {
    internal: {
      baseUrl: 'http://internal.mercadolibre.com',
    },
    middleend: {
      url: siteId => `/seller-promotions/admin-middleend/sites/${siteId}/promotions`,
      urlBatchApi: path => `/seller-promotions/batch/files/${path}`,
      urlItems: siteId => `/seller-promotions/admin-middleend/sites/${siteId}/items`,
      urlCredibilityExceptions: siteId => `/seller-promotions/admin-middleend/sites/${siteId}/credibility_whitelist`,
      scope: 'test',
    },
  },
  assets: {
    prefix: `https://http2.mlstatic.com/frontend-assets/${APPLICATION || pkg.name}/`,
  },
  audits: {
    auditName: 'test-pandora-audit',
    writeTimeout: 500,
  },
};
