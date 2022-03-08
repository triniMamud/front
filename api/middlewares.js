const { authorization } = require('odin/security');
const config = require('nordic/config');

const { actionMap } = config.get('security');

const authorizeAction = action => (req, res, next) => {
  const { actionId } = req.params;
  const scopes = actionMap[action || actionId];
  return authorization({ scopes })(req, res, next);
};

module.exports = {
  authorizeAction,
};
