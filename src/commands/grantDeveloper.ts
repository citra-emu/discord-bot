import discord = require('discord.js');

export const roles = ['Admins', 'Moderators', 'CitraBot'];
export function command (message: discord.Message) {
  const role = process.env.DISCORD_DEVELOPER_ROLE;
  message.mentions.users.map((user) => {
    const member = message.guild.member(user);
    const alreadyJoined = member.roles.cache.has(role);

    if (alreadyJoined) {
      member.roles.remove(role);
      message.channel.send(`${user.toString()}'s speech has been revoked in the #development channel.`);
    } else {
      member.roles.remove(role);
      message.channel.send(`${user.toString()} has been granted speech in the #development channel.`);
    }
  });
}
