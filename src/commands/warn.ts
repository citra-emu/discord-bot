import state from '../state';
import * as data from '../data';
import logger from '../logging';
import UserWarning from '../models/UserWarning';
import discord = require('discord.js');

exports.roles = ['Admins', 'Moderators'];
exports.command = function (message: discord.Message) {
  const silent = message.content.includes('silent');

  message.mentions.users.map((user) => {
    const count = state.warnings.filter(x => x.id === user.id && !x.cleared).length || 0;

    if (silent === false) {
      message.channel.send(`${user.toString()} You have been warned. Additional infractions may result in a ban.`);
    }

    logger.info(`${message.author.username} ${message.author} has warned ${user.username} ${user} [${count} + 1].`);
    state.logChannel.send(`${message.author.toString()} has warned ${user.toString()} [${count} + 1].`);

    state.warnings.push(new UserWarning(user.id, user.username, message.author.id, message.author.username, count, silent));
    data.flushWarnings();
  });
};
