const buildRestClientContext = require('frontend-restclient/src/build-context');
const router = require('nordic/ragnar').router();
const { authorization } = require('odin/security');

const multer = require('multer');

const upload = multer();

const CredibilityExceptionsService = require('../services/credibility');

const { handleErrorResponse } = require('../app/helpers/errorHandler');

router.use(
  authorization.default({
    blockade: (req, res) => {
      res.status(401).json({ message: 'unauthorized' });
    },
  }),
);

router.get(
  '/exceptions',
  authorization({ scopes: ['SP_CENTRAL_PROMOTION_CREDIBILITY_EXCEPTIONS'] }),
  async (req, res) => {
    const {
      user: { userId },
      query: { siteId, ...params },
    } = req;
    const config = CredibilityExceptionsService.getConfig(req);
    try {
      const { status, data } = await CredibilityExceptionsService.getForm(
        userId,
        config,
        params,
        buildRestClientContext(req),
      );
      return res.status(status).json(data);
    } catch (error) {
      return handleErrorResponse(res, error);
    }
  },
);

router.post('/upload', upload.single('file'), async (req, res) => {
  const {
    file,
    user: { userId },
  } = req;

  try {
    const data = await CredibilityExceptionsService.uploadCsvFileCredibility(file, userId, buildRestClientContext(req));

    return res.status(200).json(data);
  } catch (error) {
    return handleErrorResponse(res, error);
  }
});
/**
 * Expose router
 */
module.exports = router;
