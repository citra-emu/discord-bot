const fs = require('fs');
const state = require('./state.js');
const logger = require('./logging.js');

function readWarnings () {
  // Load the warnings file into the bans variable.
  fs.readFile('data/discordWarnings.json', 'utf8', function (err, data) {
    if (err && err.code === 'ENOENT') { return; }
    if (err) { logger.error(err); }
    state.warnings = JSON.parse(data);
    logger.debug('Loaded warnings file.');
  });
}

function readBans () {
  // Load the ban file into the bans variable.
  fs.readFile('data/discordBans.json', 'utf8', function (err, data) {
    if (err && err.code === 'ENOENT') { return; }
    if (err) { logger.error(err); }
    state.bans = JSON.parse(data);
    logger.debug('Loaded bans file.');
  });
}

function readCustomResponses()
{
  // Load the responses file into the responses variable.
  fs.readFile('data/responses.json', 'utf8', function (err, data) {
    if (err && err.code === 'ENOENT') { return; }
    if (err) { logger.error(err); }
    state.responses = JSON.parse(data);
    logger.debug('Loaded responses file.');
  });
}

function flushWarnings () {
  var warningsJson = JSON.stringify(state.warnings, null, 4);
  if (!fs.existsSync('./data/')) fs.mkdirSync('data');
  fs.writeFile('data/discordWarnings.json', warningsJson, 'utf8', function (err) {
    if (err) { logger.error(err); }
  });
}

function flushBans () {
  var bansJson = JSON.stringify(state.bans, null, 4);
  if (!fs.existsSync('data')) fs.mkdirSync('data');
  fs.writeFile('data/discordBans.json', bansJson, 'utf8', function (err) {
    if (err) { logger.error(err); }
  });
}

module.exports = { readWarnings: readWarnings, readBans: readBans, readCustomResponses: readCustomResponses, flushWarnings: flushWarnings, flushBans: flushBans };
