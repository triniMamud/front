/**
 * Module dependencies
 */
const router = require('nordic/ragnar').router();
const { getCountryInfo } = require('../services/country');

router.get('/', async (req, res) => {
  try {
    const data = await getCountryInfo(req.query.countryId);

    res.json(data);
  } catch (e) {
    res
      .status(e.response ? e.response.status : 500)
      .json(e.response ? e.response.data : { message: e.message });
  }
});

/**
 * Expose router
 */
module.exports = router;
