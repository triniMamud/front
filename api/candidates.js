const buildRestClientContext = require('frontend-restclient/src/build-context');
const router = require('nordic/ragnar').router();
const { authorization } = require('odin/security');
const { saveAudit, buildCurrentData } = require('../services/audits');
const PromotionsService = require('../services/promotions');

const CandidatesService = require('../services/candidates');

const { handleErrorResponse } = require('../app/helpers/errorHandler');

router.use(
  authorization.default({
    blockade: (req, res) => {
      res.status(401).json({ message: 'unauthorized' });
    },
  }),
);

router.get(
  '/:promotionId/candidates/items',
  authorization({ scopes: ['SP_CENTRAL_PROMOTION_CANDIDATES_ITEMS_LIST'] }),
  async (req, res) => {
    const {
      params: { promotionId },
      user: { userId, sessionId },
      query: { siteId, ...params },
    } = req;

    const config = PromotionsService.getConfig(req);

    try {
      /*
     We added this timeout in order to show the correct updates of the offers.
     We have a delay between the DB update and the refresh list.
     With this update we avoid the problem that the offers appears without update.
     */
      setTimeout(async () => {
        const { status, data } = await CandidatesService.getItemsOfferList(
          promotionId,
          userId,
          config,
          params,
          buildRestClientContext(req),
        );

        saveAudit(
          'get-offer-candidates',
          userId,
          'offers',
          sessionId,
          buildCurrentData(req.traceRequestId, req, res.outputData, status, {}),
          null,
          ['get', 'offer', 'get-offercandidates'],
        );

        return res.status(status).json(data);
      }, 1000);
    } catch (error) {
      return handleErrorResponse(res, error);
    }
  },
);

router.get('/:promotionId/candidates/invalid', async (req, res) => {
  const {
    params: { promotionId },
    user: { userId, sessionId },
    query: { siteId, ...params },
  } = req;

  const config = PromotionsService.getConfig(req);

  try {
    setTimeout(async () => {
      const { status, data } = await CandidatesService.getItemsList(
        promotionId,
        userId,
        config,
        params,
        buildRestClientContext(req),
      );

      saveAudit(
        'get-invalidcandidates',
        userId,
        'offers',
        sessionId,
        buildCurrentData(req.traceRequestId, req, res.outputData, status, {}),
        null,
        ['get', 'offer', 'get-invalidcandidates'],
      );

      return res.status(status).json(data);
    }, 1000);
  } catch (error) {
    return handleErrorResponse(res, error);
  }
});

/**
 * Expose router
 */
module.exports = router;
