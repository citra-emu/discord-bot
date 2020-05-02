import state from '../state';
import * as data from '../data';
import logger from '../logging';
import UserBan from '../models/UserBan';
import discord = require('discord.js');

export const roles = ['Admins', 'Moderators', 'CitraBot'];
export function command (message: discord.Message) {
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
