import discord = require('discord.js');

export const roles = ['Admins', 'Moderators'];
export function command (message: discord.Message, reply: string) {
  let replyMessage = 'Hello.';
  if (reply == null) {
    replyMessage = message.content.substr(message.content.indexOf(' ') + 1);
  } else {
    replyMessage = `${message.mentions.users.map(user => `${user}`)} ${reply}`;
  }

  message.channel.send(replyMessage);
}
