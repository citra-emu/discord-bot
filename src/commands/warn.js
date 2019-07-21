const state = require('../state.js');
const data = require('../data.js');
const logger = require('../logging.js');
const UserWarning = require('../models/UserWarning.js');

exports.roles = ['Admins', 'Moderators'];
exports.command = function (message) {
  message.mentions.users.map((user) => {
    const count = state.warnings.filter(x => x.id === user.id && !x.cleared).length || 0;
    message.channel.send(`${user} You have been warned. Additional infractions may result in a ban.`);

    logger.info(`${message.author.username} ${message.author} has warned ${user.username} ${user} [${count} + 1].`);
    state.logChannel.send(`${message.author} has warned ${user} [${count} + 1].`);

    state.warnings.push(new UserWarning(user.id, user.username, message.author.id, message.author.username, count));
    data.flushWarnings();

    state.stats.warnings += 1;

    if (count + 1 >= 3) {
      message.channel.send(`.ban ${user}`);
    }
  });
};
