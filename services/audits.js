const { AuditClient, AuditRecord, AuditClientConfiguration } = require('nodeauditclient');
const logger = require('nordic/logger');
const config = require('nordic/config');
const pkg = require('../package');

const log = logger(pkg.name);

const auditClient = new AuditClient({
  clientConfig: new AuditClientConfiguration({
    writeTimeout: config.audits.writeTimeout,
  }),
  auditName: config.audits.auditName,
});
AuditClient.setLogLevel('info');

const saveAudit = (eventName, userName, resourceType, resourceId, currentData, previousData = {}, tags) => {
  const auditRecord = new AuditRecord({
    event: eventName,
    user: userName,
    resource_type: resourceType,
    resource_id: resourceId,
    current_data: currentData,
    previous_data: previousData,
    tags,
  });

  auditClient
    .saveAudit(auditRecord)
    .then(() => {
      log.info(`Success saving audit: ${JSON.stringify(auditRecord)}`);
    })
    .catch(err => {
      log.error('Audit failed', {
        resource: auditRecord.resource_type,
        event: auditRecord.event,
        auditName: auditClient.user,
        tag: auditClient.tags,
        resource_id: auditClient.resource_id,
        error: err,
      });
    });
};

const buildCurrentData = (requestId, req, response, status, modified_data = {}, bigReq = false, keysForAudit = {}) => {
  const http_verb = req.method;

  return {
    request_id: requestId,
    ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
    user_agent: req.user.userId,
    endpoint: req.originalUrl,
    http_verb,
    read_data: http_verb === 'GET' ? (!bigReq ? response : keysForAudit) : 'N/A',
    modified_data: http_verb !== 'GET' ? modified_data : {}, // PUT, DELETE o POST
    approvals: 'N/A',
    result: status, // statusCode
  };
};

module.exports = {
  saveAudit,
  buildCurrentData,
};
