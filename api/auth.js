/**
 * Module dependencies
 */
const router = require('nordic/ragnar').router();

const { authorization } = require('odin/security');

router.use(
  authorization.default({
    blockade: (req, res) => {
      res.status(403).json({ message: 'unauthorized' });
    },
  }),
);

router.get(
  '/authorized',
  authorization({
    roles: ['DEVELOPMENT_FULL', 'PAYMENTS_FULL'],
  }),
  (req, res) => {
    res.json({ message: 'authorized' });
  },
);

router.get(
  '/unauthorized',
  authorization({
    roles: 'UNAUTHORIZED',
  }),
  (req, res) => {
    res.json({ message: 'authorized' });
  },
);

/**
 * Expose router
 */
module.exports = router;
