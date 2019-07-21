const request = require('request');

const regex = /[^<\\]#(\d+)/ig;

exports.trigger = function (message) {
  return new RegExp(regex).test(message.content);
};

exports.execute = function (message) {
  let matcher = new RegExp(regex);
  let match = matcher.exec(message.content);
  let matched = [];
  let threshold = process.env.GITHUB_OLD_THRESHOLD || 2000;
  let repo = process.env.GITHUB_REPOSITORY || "citra-emu/citra";

  while (match != null) {
    if (matched.indexOf(match[1]) === -1) {
      matched.push(match[1]);
    } else {
      match = matcher.exec(message.content);
      continue;
    }

    // We do not want to automatically match old issues / PRs.
    // This usually happens when someone messes up pinging another person or
    // in general conversation.
    // ex: You're #1!
    if (match[1] < threshold) { return; }

    // Map domain path to type
    let map = {'pull': 'Pull Request', 'issues': 'Issue'};

    let url = `https://github.com/${repo}/pull/${match[1]}`;
    request(url, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        // Set path to type of comment (issues/pull)
        let path = response.request.uri.pathname.split('/')[3];

        message.channel.send(`Github ${map[path]}: ${url}`);
      }
    });

    match = matcher.exec(message.content);
  }
};
