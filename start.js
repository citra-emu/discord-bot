var forever = require('forever-monitor');
var config = require('config')

var child = new (forever.Monitor)('server.js', {
  silent: !config.production
});

child.start(true);
