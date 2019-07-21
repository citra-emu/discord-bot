const state = require('../state.js');
const data = require('../data.js');
const logger = require('../logging.js');
const UserBan = require('../models/UserBan.js');

exports.roles = ['Admins', 'Moderators', 'CitraBot'];
exports.command = function (message) {
  message.mentions.users.map((user) => {
    const count = state.warnings.filter(x => x.id === user.id && !x.cleared).length || 0;

    logger.info(`${message.author.toString()} has banned ${user.toString()} ${user} ${user.username}.`);
    state.logChannel.send(`${message.author} has banned ${user} ${user.username} [${count}].`);

    state.bans.push(new UserBan(user.id, user.username, message.author.id, message.author.username, count));

    message.guild.member(user).ban().catch(function (error) {
      state.logChannel.send(`Error banning ${user} ${user.username}`);
      logger.error(`Error banning ${user.toString()} ${user} ${user.username}.`, error);
    });

    data.flushBans();
  });
};
