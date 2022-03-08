/**
 * Module dependencies
 */
const buildRestClientContext = require('frontend-restclient/src/build-context');
const router = require('nordic/ragnar').router();

const sitesService = require('./services/sites');

router.get('/:siteId', async (req, res) => {
  try {
    const site = await sitesService.getSite(req.params.siteId, buildRestClientContext(req));

    res.json(site);
  } catch (e) {
    res.status(e.response ? e.response.status : 500).json(e.response ? e.response.data : { message: e.message });
  }
});

/**
 * Expose router
 */
module.exports = router;
