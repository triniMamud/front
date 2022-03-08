const buildRestClientContext = require('frontend-restclient/src/build-context');
const router = require('nordic/ragnar').router();
const { authorization } = require('odin/security');

const ItemService = require('../services/items');
const { saveAudit, buildCurrentData } = require('../services/audits');

const { handleErrorResponse } = require('../app/helpers/errorHandler');

router.use(
  authorization.default({
    blockade: (req, res) => {
      res.status(401).json({ message: 'unauthorized' });
    },
  }),
);

router.get('/search', async (req, res) => {
  const {
    user: { userId, sessionId },
    query: { siteId, ...params },
  } = req;
  const config = ItemService.getConfig(req);
  try {
    const { status, data } = await ItemService.getItemData(userId, config, params, buildRestClientContext(req));

    saveAudit(
      'searchItem',
      userId,
      'promotions',
      sessionId,
      buildCurrentData(req.traceRequestId, req, res.outputData, status, {}),
      { config },
      ['get', 'promotions', 'search-item'],
    );

    return res.status(status).json(data);
  } catch (error) {
    return handleErrorResponse(res, error);
  }
});
/**
 * Expose router
 */
module.exports = router;
