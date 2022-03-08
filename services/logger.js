const logger = require('nordic/logger');
const pkg = require('../package');

const log = logger(pkg.name);

module.exports = {
  log,
};
