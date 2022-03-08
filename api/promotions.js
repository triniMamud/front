const buildRestClientContext = require('frontend-restclient/src/build-context');
const router = require('nordic/ragnar').router();

const { authorization } = require('odin/security');

const multer = require('multer');

const PromotionsService = require('../services/promotions');
const OffersService = require('../services/offers');
const MassiveOfferService = require('../services/massive-offers');
const { saveAudit, buildCurrentData } = require('../services/audits');
const { authorizeAction } = require('./middlewares');

const { handleErrorResponse } = require('../app/helpers/errorHandler');

const upload = multer();

router.use(
  authorization.default({
    blockade: (req, res) => {
      res.status(401).json({ message: 'unauthorized' });
    },
  }),
);

router.get('/list', async (req, res) => {
  const {
    query,
    user: { userId, sessionId },
  } = req;
  const config = PromotionsService.getConfig(req);

  try {
    const result = await PromotionsService.list(query, config, buildRestClientContext(req), req.user.roles);
    saveAudit(
      'get',
      userId,
      'promotions',
      sessionId,
      buildCurrentData(req.traceRequestId, req, res.outputData, res.statusCode, {}),
      null,
      ['post', 'promotions', 'getpromotionslist'],
    );
    return res.status(200).json(result);
  } catch (error) {
    return handleErrorResponse(res, error);
  }
});

router.post('/edit', authorization({ scopes: ['SP_CENTRAL_PROMOTION_CREATE'] }), async (req, res) => {
  const {
    user: { userId, sessionId },
    body,
  } = req;
  const config = PromotionsService.getConfig(req);
  try {
    const result = await PromotionsService.submitEditForm(body, userId, config, sessionId, buildRestClientContext(req));

    saveAudit(
      'editpromotion',
      userId,
      'promotions',
      sessionId,
      buildCurrentData(req.traceRequestId, req, res.outputData, res.statusCode, {}),
      { config },
      ['post', 'promotions', 'edit-promotion'],
    );

    return res.status(200).json(result);
  } catch (error) {
    return handleErrorResponse(res, error);
  }
});

router.get('/:promotionId/offers', authorization({ scopes: ['SP_CENTRAL_PROMOTION_OFFER_LIST'] }), async (req, res) => {
  const {
    params: { promotionId },
    user: { userId, sessionId },
    query,
  } = req;
  const config = PromotionsService.getConfig(req);

  try {
    /*
      We added this timeout in order to show the correct updates of the offers.
      We have a delay between the DB update and the refresh list.
      With this update we avoid the problem that the offers appears without update.
    */
    setTimeout(async () => {
      const { status, data } = await OffersService.getOffersList(
        promotionId,
        userId,
        config,
        query,
        buildRestClientContext(req),
      );
      saveAudit(
        'getofferslist',
        userId,
        'offers',
        sessionId,
        buildCurrentData(req.traceRequestId, req, res.outputData, status, {}),
        null,
        ['get', 'offer', 'get-offer'],
      );

      return res.status(status).json(data);
    }, 1000);
  } catch (error) {
    return handleErrorResponse(res, error);
  }
});

router.post(
  '/:promotionId/action',
  authorization({ scopes: ['SP_CENTRAL_PROMOTION_OFFER_LIST'] }),
  async (req, res) => {
    const {
      params: { promotionId },
      user: { userId, sessionId },
      query,
      body,
    } = req;
    const config = PromotionsService.getConfig(req);

    try {
      const { status, data } = await PromotionsService.getActionModal(
        query,
        body,
        promotionId,
        userId,
        config,
        buildRestClientContext(req),
      );

      saveAudit(
        'getpromotionactionmodal',
        userId,
        'promotions',
        sessionId,
        buildCurrentData(req.traceRequestId, req, res.outputData, status, {}),
        null,
        ['post', 'promotions', 'get-actionmodal'],
      );

      return res.status(status).json(data);
    } catch (error) {
      return handleErrorResponse(res, error);
    }
  },
);

router.post('/:promotionId/simulate', async (req, res) => {
  const {
    params: { promotionId },
    user: { userId, sessionId },
    cookies: { cookieSiteId },
    body,
  } = req;
  const config = PromotionsService.getConfig(req);

  try {
    const { status, data } = await PromotionsService.simulateCampaign(
      promotionId,
      body,
      userId,
      config,
      buildRestClientContext(req),
    );

    saveAudit(
      'simulatepromotion',
      userId,
      'promotions',
      sessionId,
      buildCurrentData(req.traceRequestId, req, res.outputData, status, {}),
      null,
      ['post', 'promotions', 'simulate'],
    );

    return res.status(status).json(data);
  } catch (error) {
    return handleErrorResponse(res, error);
  }
});

router.put('/:promotionId/status/delete', authorizeAction(), async (req, res) => {
  const {
    user: { userId, sessionId, roles },
    body: { promotionId, reason },
  } = req;
  const config = PromotionsService.getConfig(req);

  try {
    const body = {
      promotionId,
      reason: reason || 'Fake reason',
    };

    const { status, data } = await PromotionsService.updateStatus(
      body,
      'cancel',
      userId,
      config,
      roles,
      buildRestClientContext(req),
    );

    saveAudit(
      'deletepromotion',
      userId,
      'promotions',
      sessionId,
      buildCurrentData(req.traceRequestId, req, res.outputData, status, {}),
      null,
      ['put', 'promotions', 'delete-promotion'],
    );

    return res.status(status).json(data);
  } catch (error) {
    return handleErrorResponse(res, error);
  }
});

router.put('/:promotionId/status/:actionId', authorizeAction(), async (req, res) => {
  const {
    user: { userId, sessionId, roles },
    body,
    params: { actionId },
  } = req;
  const config = PromotionsService.getConfig(req);

  try {
    let data;
    let status;

    if (actionId === 'approve' || actionId === 'reject') {
      ({ status, data } = await PromotionsService.approveRejectPromotion(
        body,
        actionId,
        userId,
        config,
        roles,
        buildRestClientContext(req),
      ));
    } else {
      ({ status, data } = await PromotionsService.updateStatus(
        body,
        actionId,
        userId,
        config,
        roles,
        buildRestClientContext(req),
      ));
    }

    saveAudit(
      'updatepromotionbyaction',
      userId,
      'promotions',
      sessionId,
      buildCurrentData(req.traceRequestId, req, res.outputData, status, {}),
      null,
      ['put', 'promotion'],
    );

    return res.status(status).json(data);
  } catch (error) {
    return handleErrorResponse(res, error);
  }
});

router.put('/actions', authorizeAction(), async (req, res) => {
  const {
    user: { userId, sessionId },
    body,
    query: { apiUrl },
  } = req;
  const config = PromotionsService.getConfig(req);

  try {
    const { status, data } = await PromotionsService.put(body, apiUrl, userId, config, buildRestClientContext(req));

    saveAudit(
      'updateoffer',
      userId,
      'offers',
      sessionId,
      buildCurrentData(req.traceRequestId, req, res.outputData, status, {}),
      null,
      ['put', 'promotion'],
    );

    return res.status(status).json(data);
  } catch (error) {
    return handleErrorResponse(res, error);
  }
});

router.post(
  '/:promotionId/offers/validate',
  authorization({ scopes: ['SP_CENTRAL_PROMOTION_OFFER_ADD'] }),
  async (req, res) => {
    const {
      params: { promotionId },
      user: { userId, sessionId },
      body,
    } = req;
    const config = PromotionsService.getConfig(req);

    try {
      const result = await OffersService.validateItem(body, config, promotionId, userId, buildRestClientContext(req));

      saveAudit(
        'getandvalidateitems',
        userId,
        'offers',
        sessionId,
        buildCurrentData(req.traceRequestId, req, res.outputData, null, {}),
        null,
        ['post', 'offer', 'validate'],
      );

      return res.status(result.status).json(result.data);
    } catch (error) {
      return handleErrorResponse(res, error);
    }
  },
);

router.get(
  '/:promotionId/offers/:offerId',
  authorization({ scopes: ['SP_CENTRAL_OFFER_MODIFY'] }),
  async (req, res) => {
    const {
      params: { promotionId, offerId },
      user: { userId, sessionId },
      query: { siteId },
    } = req;
    const config = PromotionsService.getConfig(req);

    try {
      const result = await OffersService.getOfferEditForm(
        promotionId,
        offerId,
        userId,
        config,
        buildRestClientContext(req),
      );

      saveAudit(
        'getoffer',
        userId,
        'offers',
        sessionId,
        buildCurrentData(req.traceRequestId, req, res.outputData, res.statusCode, {}),
        null,
        ['get', 'offer'],
      );

      return res.status(result.status).json(result.data);
    } catch (error) {
      return handleErrorResponse(res, error);
    }
  },
);

router.post('/action', authorization({ scopes: ['SP_CENTRAL_PROMOTION_OFFER_ADD'] }), async (req, res) => {
  const {
    query: { apiUrl, siteId },
    user: { userId, sessionId },
    body,
  } = req;
  const config = PromotionsService.getConfig(req);

  try {
    const result = await PromotionsService.post(body, apiUrl, userId, config, buildRestClientContext(req));

    saveAudit(
      'addoffer',
      userId,
      'offers',
      sessionId,
      buildCurrentData(req.traceRequestId, req, res.outputData, res.statusCode, {}),
      null,
      ['post', 'offer', 'validate'],
    );

    return res.status(200).json(result);
  } catch (error) {
    return handleErrorResponse(res, error);
  }
});

router.put(
  '/:promotionId/offers/:offerId',
  authorization({ scopes: ['SP_CENTRAL_OFFER_MODIFY'] }),
  async (req, res) => {
    const {
      params: { promotionId, offerId },
      user: { userId, sessionId },
      body,
    } = req;
    const config = PromotionsService.getConfig(req);

    try {
      const result = await OffersService.editOffer(
        body,
        config,
        promotionId,
        offerId,
        userId,
        buildRestClientContext(req),
      );

      saveAudit(
        'updateoffer',
        userId,
        'offers',
        sessionId,
        buildCurrentData(req.traceRequestId, req, res.outputData, result.status, {}),
        null,
        ['put', 'offer', 'update-promotion'],
      );

      return res.status(result.status).json(result.data);
    } catch (error) {
      return handleErrorResponse(res, error);
    }
  },
);

router.delete(
  '/:promotionId/offers/:offerId',
  authorization({ scopes: ['SP_CENTRAL_OFFER_REMOVE'] }),
  async (req, res) => {
    const {
      params: { promotionId, offerId },
      user: { userId, sessionId },
    } = req;
    const config = PromotionsService.getConfig(req);

    try {
      const result = await OffersService.deleteOffer(promotionId, offerId, userId, config, buildRestClientContext(req));

      saveAudit(
        'deleteoffer',
        userId,
        'offers',
        sessionId,
        buildCurrentData(req.traceRequestId, req, res.outputData, result.status, {}),
        null,
        ['delete', 'offer'],
      );

      return res.status(result.status).json(result.data);
    } catch (error) {
      return handleErrorResponse(res, error);
    }
  },
);

router.post(
  '/:promotionId/offers/:offerId/approve',
  authorization({ scopes: ['SP_CENTRAL_PROMOTION_APPROVE'] }),
  async (req, res) => {
    const {
      params: { promotionId, offerId },
      user: { userId, sessionId },
      body: { siteId },
    } = req;
    const config = PromotionsService.getConfig(req);

    try {
      const result = await OffersService.approveOffer(
        promotionId,
        offerId,
        userId,
        config,
        buildRestClientContext(req),
      );

      saveAudit(
        'postapproveoffer',
        userId,
        'offers',
        sessionId,
        buildCurrentData(req.traceRequestId, req, res.outputData, result.status, {}),
        null,
        ['post', 'offer', 'approve'],
      );

      return res.status(result.status).json(result.data);
    } catch (error) {
      return handleErrorResponse(res, error);
    }
  },
);

router.post('/:promotionId/offers/upload', upload.single('file'), async (req, res) => {
  const {
    file,
    params: { promotionId, offerId },
    user: { userId, sessionId },
  } = req;

  try {
    const data = await PromotionsService.uploadCsvFile(file, promotionId, userId, buildRestClientContext(req));

    saveAudit(
      'uploadfile',
      userId,
      'offers',
      sessionId,
      buildCurrentData(req.traceRequestId, req, res.outputData, res.statusCode, {}),
      null,
      ['post', 'offer', 'file'],
    );

    return res.status(200).json(data);
  } catch (error) {
    return handleErrorResponse(res, error);
  }
});

router.get('/csv/template', async (req, res) => {
  const { siteId } = PromotionsService.getConfig(req);

  try {
    const { data, contentDisposition } = await PromotionsService.csvTemplate(siteId, buildRestClientContext(req));

    // Return the response as csv file.
    res.set('Content-Type', 'text/csv');
    res.setHeader('Content-disposition', contentDisposition);
    data.pipe(res);
  } catch (error) {
    return res.status(400).json(error.response ? error.response.data : error);
  }
});

router.post('/create', authorization({ scopes: ['SP_CENTRAL_PROMOTION_CREATE'] }), async (req, res) => {
  const {
    user: { userId, sessionId },
    body,
    query,
  } = req;
  const config = PromotionsService.getConfig(req);

  try {
    const params = {
      ...query,
      userId,
      sessionId,
    };
    const result = await PromotionsService.creatorFlow(params, config, buildRestClientContext(req), body);

    saveAudit(
      'updatepromotion',
      userId,
      'promotions',
      sessionId,
      buildCurrentData(req.traceRequestId, req, res.outputData, res.statusCode, {}),
      null,
      ['post', 'createpromotion'],
    );

    return res.status(200).json(result);
  } catch (error) {
    return handleErrorResponse(res, error);
  }
});

router.put('/executeAction', authorization({ scopes: ['SP_CENTRAL_PROMOTION_CREATE'] }), async (req, res) => {
  const {
    user: { userId, sessionId },
    query,
  } = req;
  const config = PromotionsService.getConfig(req);

  try {
    const params = {
      ...query,
      userId,
      sessionId,
    };
    const result = await PromotionsService.executeAction(params, config, buildRestClientContext(req));

    saveAudit(
      'executeaction',
      userId,
      'promotions',
      sessionId,
      buildCurrentData(req.traceRequestId, req, res.outputData, result.status, {}),
      null,
      ['put', 'executeaction'],
    );

    return res.status(200).json(result);
  } catch (error) {
    return handleErrorResponse(res, error);
  }
});

router.post('/:promotionId/items/upload', upload.single('file'), async (req, res) => {
  const {
    user: { userId, sessionId },
    params: { promotionId },
    query: { type },
    file,
  } = req;

  try {
    const data = await PromotionsService.uploadCsvFileRequirements(
      file,
      userId,
      promotionId,
      type,
      buildRestClientContext(req),
    );

    saveAudit(
      'uploadfilerequirements',
      userId,
      'promotions',
      sessionId,
      buildCurrentData(req.traceRequestId, req, res.outputData, data.status, {}),
      null,
      ['post', 'file-requirements'],
    );

    return res.status(200).json(data);
  } catch (error) {
    return handleErrorResponse(res, error);
  }
});

router.delete('/:promotionId/items/upload', async (req, res) => {
  const {
    user: { userId, sessionId },
    params: { promotionId },
    query: { type, fileId },
  } = req;

  try {
    const data = await PromotionsService.uploadItemsFileRequirements(
      userId,
      promotionId,
      type,
      fileId,
      buildRestClientContext(req),
    );

    saveAudit(
      'deletefilerequirements',
      userId,
      'promotions',
      sessionId,
      buildCurrentData(req.traceRequestId, req, res.outputData, data.status, {}),
      null,
      ['delete', 'file-requirements'],
    );

    return res.status(200).json(data);
  } catch (error) {
    return handleErrorResponse(res, error);
  }
});

router.get('/duplicate', authorization({ scopes: ['SP_CENTRAL_PROMOTION_CREATE'] }), async (req, res) => {
  const {
    user: { userId, sessionId },
    query,
  } = req;
  const config = PromotionsService.getConfig(req);

  try {
    const params = {
      ...query,
      userId,
      sessionId,
    };
    const result = await PromotionsService.getPromotion(params, config, buildRestClientContext(req));

    saveAudit(
      'getDuplicate',
      userId,
      'promotions',
      sessionId,
      buildCurrentData(req.traceRequestId, req, res.outputData, res.statusCode, {}),
      { config },
      ['get', 'promotions', 'duplicate-promotions'],
    );

    return res.status(200).json(result);
  } catch (error) {
    return handleErrorResponse(res, error);
  }
});

router.post('/duplicate', authorization({ scopes: ['SP_CENTRAL_PROMOTION_CREATE'] }), async (req, res) => {
  const {
    user: { userId, sessionId },
    body: { promotion },
    query,
  } = req;
  const config = PromotionsService.getConfig(req);

  try {
    const params = {
      ...query,
      userId,
      sessionId,
      promotion,
    };
    const result = await PromotionsService.duplicateCampaign(params, config, buildRestClientContext(req));

    saveAudit(
      'postDuplicate',
      userId,
      'promotions',
      sessionId,
      buildCurrentData(req.traceRequestId, req, res.outputData, res.statusCode, {}),
      { config },
      ['post', 'promotions', 'duplicate-promotions'],
    );

    return res.status(200).json(result);
  } catch (error) {
    return handleErrorResponse(res, error);
  }
});

router.get('/offers/massive', async (req, res) => {
  const {
    user: { userId },
    query: { siteId, ...params },
  } = req;
  const config = PromotionsService.getConfig(req);
  try {
    const { status, data } = await MassiveOfferService.getForm(userId, config, params, buildRestClientContext(req));
    return res.status(status).json(data);
  } catch (error) {
    return res.status(error.response?.status ?? 500).json(error.response?.data ?? error);
  }
});

router.post('/offers/massive', upload.single('file'), async (req, res) => {
  const {
    file,
    user: { userId, sessionId },
    query: { offerType },
  } = req;
  const config = PromotionsService.getConfig(req);
  try {
    const data = await MassiveOfferService.uploadCsvFileMassive(
      file,
      offerType,
      userId,
      config,
      buildRestClientContext(req),
    );

    saveAudit(
      'postMassiveOffers',
      userId,
      'offers',
      sessionId,
      buildCurrentData(req.traceRequestId, req, res.outputData, data.statusCode, {}),
      { config },
      ['post', 'offers', 'massive-offers'],
    );
    return res.status(200).json(data);
  } catch (error) {
    return handleErrorResponse(res, error);
  }
});

router.get('/offers/massive/action', async (req, res) => {
  const {
    user: { userId },
    query,
  } = req;

  const config = PromotionsService.getConfig(req);
  try {
    const { status, data } = await MassiveOfferService.getModalMassiveOffer(
      userId,
      config,
      query,
      buildRestClientContext(req),
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
