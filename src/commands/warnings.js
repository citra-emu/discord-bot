const state = require('../state.js');

exports.command = function (message) {
  message.mentions.users.map((user) => {
    const warnings = state.warnings.filter(x => x.id === user.id && !x.cleared);
    message.channel.send(`${user}, you have ${warnings.length} total warnings.`);
  });
};
