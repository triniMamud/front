/**
 * Module dependencies
 */
const router = require('nordic/ragnar').router();
const { authentication } = require('odin/security');
const populateUser = require('../app/middlewares/populateUser');
const auth = require('./auth');
const sites = require('./sites');
const promotions = require('./promotions');
const candidates = require('./candidates');
const items = require('./items');
const country = require('./country');
const credibility = require('./credibility');

/**
 * Demo router
 */

router.use(authentication());
router.use(populateUser);

router.use('/auth', auth);
router.use('/sites', sites);
router.use('/promotions', promotions);
router.use('/credibility', credibility);
router.use('/promotions', candidates);
router.use('/items', items);
router.use('/country', country);

/**
 * Expose API router
 */
module.exports = router;
