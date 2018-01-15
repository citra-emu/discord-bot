const request = require('request');
const logger = require('../logging.js');

exports.roles = ['Admins', 'Moderators', 'Developers'];
exports.command = function (message) {
    let pr = message.content.substr(message.content.indexOf(' ') + 1).replace(/\n/g, '');

    let repo = process.env.GITHUB_REPOSITORY || "citra-emu/citra";
    let url = `https://api.github.com/repos/${repo}/pulls/${pr}`;
    
    request({ url: url, headers: { 'User-Agent': 'Citra-Emu/CitraBot (Node.js)'}}, function (error, response, body) {
    if (!error) {
      var pr = JSON.parse(body);
      request({ url: pr.statuses_url, headers: { 'User-Agent': 'Citra-Emu/CitraBot (Node.js)'}}, function(error, response, body)
      {
        var statuses = JSON.parse(body);

        if (statuses.length == 0) return;

	// Travis CI will give you multiple, identical target URLs so we might as well just check the first one...
        var status = statuses[0];
        status.target_url = status.target_url.substr(0, status.target_url.indexOf('?'));
        message.channel.sendMessage(`${status.context}: ${status.target_url}: **${status.state}**`);
      });
    }
    else
    {
      message.channel.sendMessage('No such PR.');
    }
  });
};
