const request = require('request');

const regex = /([a-zA-Z]+)?\#(\d+)/ig;

exports.trigger = function (message) {
  return new RegExp(regex).test(message.content);
};

exports.execute = function (message) {
  let matcher = new RegExp(regex);
  let match = matcher.exec(message.content);
  let matched = [];

  while (match != null) {
    if (matched.indexOf(match[1]) === -1) {
      matched.push(match[1]);
    } else {
      match = matcher.exec(message.content);
      continue;
    }

    let baseurl;

    // Check which repo is wanted
    switch(match[1])
    {
      case 'yuzu':
        baseurl = 'https://github.com/yuzu-emu/yuzu/pull/';
        break;
      case 'citra':
        baseurl = 'https://github.com/citra-emu/citra/pull/';
        break;
      default:
        return;
    }
    
    // Map domain path to type
    let map = {'pull': 'Pull Request', 'issues': 'Issue'};

    let url = `${baseurl}${match[2]}`;
    request(url, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        
        // Set path to type of comment (issues/pull)
        let path = response.request.uri.pathname.split('/')[3];
        
        message.channel.sendMessage(`Github ${map[path]}: ${url}`);
      }
    });

    match = matcher.exec(message.content);
  }
};
