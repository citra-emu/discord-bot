import state from '../state';
import * as data from '../data';
import logger from '../logging';
import discord = require('discord.js');

export const roles = ['Admins', 'Moderators'];
export function command (message: discord.Message) {
  message.mentions.users.map((user) => {
    const count = state.warnings.filter(x => x.id === user.id && !x.cleared);
    if (count != null && count.length > 0) {
      count.forEach(warning => { warning.cleared = true; });
      data.flushWarnings();
      message.channel.send(`${user}, your warnings have been cleared.`);
    } else {
      message.channel.send(`${user}, you have no warnings to clear.`);
    }

    logger.info(`${message.author.username} has cleared all warnings for ${user} ${user.username} [${count.length}].`);
    state.logChannel.send(`${message.author.toString()} has cleared all warnings for ${user.toString()} [${count.length}].`);
  });
};
