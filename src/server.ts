// Check for environmental variables.
require('checkenv').check();

import discord = require('discord.js');
import path = require('path');
// const schedule = require('node-schedule');
import fs = require('fs');

import logger from './logging';
import state from './state';
import * as data from './data';

state.responses = require('./responses.json');

interface IModuleMap {
  [name: string]: any;
}

let cachedModules: IModuleMap = {};
let cachedTriggers: any[] = [];
const client = new discord.Client();

const mediaUsers = new Map();

logger.info('Application startup. Configuring environment.');

function findArray(haystack: string | any[], arr: any[]) {
  return arr.some(function (v: any) {
    return haystack.indexOf(v) >= 0;
  });
}

function IsIgnoredCategory(categoryName: string) {
  const IgnoredCategory = ['welcome', 'team', 'website-team'];
  return IgnoredCategory.includes(categoryName);
}

client.on('ready', async () => {
  // Initialize app channels.
  let logChannel = await client.channels.fetch(process.env.DISCORD_LOG_CHANNEL) as discord.TextChannel;
  let msglogChannel = await client.channels.fetch(process.env.DISCORD_MSGLOG_CHANNEL) as discord.TextChannel;
  if (!logChannel.send) throw new Error('DISCORD_LOG_CHANNEL is not a text channel!');
  if (!msglogChannel.send) throw new Error('DISCORD_MSGLOG_CHANNEL is not a text channel!');
  state.logChannel = logChannel;
  state.msglogChannel = msglogChannel;

  logger.info('Bot is now online and connected to server.');
});

client.on('error', (x) => {
  logger.error(x);
  logger.error('Restarting process.');
  process.exit(1);
});
client.on('warn', (x) => {
  logger.warn(x);
});

client.on('debug', (x) => null);

client.on('disconnect', () => {
  logger.warn('Disconnected from Discord server.');
});

client.on('guildMemberAdd', (member) => {
  member.roles.add(process.env.DISCORD_RULES_ROLE);
});

client.on('messageDelete', message => {
  let parent = (message.channel as discord.TextChannel).parent;
  if (parent && IsIgnoredCategory(parent.name) === false) {
    if (message.content && message.content.startsWith('.') === false && message.author.bot === false) {
      const deletionEmbed = new discord.MessageEmbed()
        .setAuthor(message.author.tag, message.author.displayAvatarURL())
        .setDescription(`Message deleted in ${message.channel}`)
        .addField('Content', message.cleanContent, false)
        .setTimestamp()
        .setColor('RED');

      state.msglogChannel.send(deletionEmbed);
      logger.info(`${message.author.username} ${message.author} deleted message: ${message.cleanContent}.`);
    }
  }
});

client.on('messageUpdate', (oldMessage, newMessage) => {
  const AllowedRoles = ['Administrators', 'Moderators', 'Team', 'VIP'];
  if (!findArray(oldMessage.member.roles.cache.map(x => x.name), AllowedRoles)) {
    let parent = (oldMessage.channel as discord.TextChannel).parent;
    if (parent && IsIgnoredCategory(parent.name) === false) {
      const oldM = oldMessage.cleanContent;
      const newM = newMessage.cleanContent;
      if (oldMessage.content !== newMessage.content && oldM && newM) {
        const editedEmbed = new discord.MessageEmbed()
          .setAuthor(oldMessage.author.tag, oldMessage.author.displayAvatarURL())
          .setDescription(`Message edited in ${oldMessage.channel} [Jump To Message](${newMessage.url})`)
          .addField('Before', oldM, false)
          .addField('After', newM, false)
          .setTimestamp()
          .setColor('GREEN');

        state.msglogChannel.send(editedEmbed);
        logger.info(`${oldMessage.author.username} ${oldMessage.author} edited message from: ${oldM} to: ${newM}.`);
      }
    }
  }
});

client.on('message', message => {
  if (message.author.bot && message.content.startsWith('.ban') === false) { return; }

  if (message.guild == null && state.responses.pmReply) {
    // We want to log PM attempts.
    logger.info(`${message.author.username} ${message.author} [PM]: ${message.content}`);
    state.logChannel.send(`${message.author} [PM]: ${message.content}`);
    message.reply(state.responses.pmReply);
    return;
  }

  logger.verbose(`${message.author.username} ${message.author} [Channel: ${(message.channel as discord.TextChannel).name} ${message.channel}]: ${message.content}`);

  if (message.channel.id === process.env.DISCORD_MEDIA_CHANNEL && !message.author.bot) {
    const AllowedMediaRoles = ['Administrators', 'Moderators', 'Team', 'VIP'];
    if (!findArray(message.member.roles.cache.map(x => x.name), AllowedMediaRoles)) {
      const urlRegex = new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/gi);
      if (message.attachments.size > 0 || message.content.match(urlRegex)) {
        mediaUsers.set(message.author.id, true);
      } else if (mediaUsers.get(message.author.id)) {
        mediaUsers.set(message.author.id, false);
      } else {
        message.delete();
        mediaUsers.set(message.author.id, false);
      }
    }
  }

  // Check if the channel is #rules, if so we want to follow a different logic flow.
  if (message.channel.id === process.env.DISCORD_RULES_CHANNEL) {
    if (message.content.toLowerCase().includes(process.env.DISCORD_RULES_TRIGGER)) {
      // We want to remove the 'Unauthorized' role from them once they agree to the rules.
      logger.verbose(`${message.author.username} ${message.author} has accepted the rules, removing role ${process.env.DISCORD_RULES_ROLE}.`);
      message.member.roles.remove(process.env.DISCORD_RULES_ROLE, 'Accepted the rules.');
    }

    // Delete the message in the channel to force a cleanup.
    message.delete();
  } else if (message.content.startsWith('.') && message.content.startsWith('..') === false) {
    // We want to make sure it's an actual command, not someone '...'-ing.
    const cmd = message.content.split(' ', 1)[0].slice(1);

    // Check by the name of the command.
    let cachedModule = cachedModules[`${cmd}.js`];
    let cachedModuleType = 'Command';
    // Check by the quotes in the configuration.
    if (cachedModule == null) { cachedModule = state.responses.quotes[cmd]; cachedModuleType = 'Quote'; }

    if (!cachedModule) return; // Not a valid command.

    // Check access permissions.
    if (cachedModule.roles !== undefined && findArray(message.member.roles.cache.map(x => x.name), cachedModule.roles) === false) {
      state.logChannel.send(`${message.author} attempted to use admin command: ${message.content}`);
      logger.info(`${message.author.username} ${message.author} attempted to use admin command: ${message.content}`);
      return false;
    }

    logger.info(`${message.author.username} ${message.author} [Channel: ${message.channel}] executed command: ${message.content}`);
    message.delete();

    try {
      if (cachedModuleType === 'Command') {
        cachedModule.command(message);
      } else if (cachedModuleType === 'Quote') {
        cachedModules['quote.js'].command(message, cachedModule.reply);
      }
    } catch (err) { logger.error(err); }

    // Warn after running command?
    try {
      // Check if the command requires a warning.
      if (cmd !== 'warn' && cachedModule.warn === true) {
        // Access check to see if the user has privileges to warn.
        const warnCommand = cachedModules['warn.js'];
        if (findArray(message.member.roles.cache.map(x => x.name), warnCommand.roles)) {
          // They are allowed to warn because they are in warn's roles.
          warnCommand.command(message);
        }
      }
    } catch (err) { logger.error(err); }

  } else if (message.author.bot === false) {
    // This is a normal channel message.
    cachedTriggers.forEach(function (trigger) {
      if (trigger.roles === undefined || findArray(message.member.roles.cache.map(x => x.name), trigger.roles)) {
        if (trigger.trigger(message) === true) {
          logger.debug(`${message.author.username} ${message.author} [Channel: ${message.channel}] triggered: ${message.content}`);
          try {
            trigger.execute(message);
          } catch (err) { logger.error(err); }
        }
      }
    });
  }
});

// Cache all command modules.
cachedModules = {};
fs.readdirSync('./commands/').forEach(function (file) {
  // Load the module if it's a script.
  if (path.extname(file) === '.js') {
    if (file.includes('.disabled')) {
      logger.info(`Did not load disabled module: ${file}`);
    } else {
      logger.info(`Loaded module: ${file}`);
      cachedModules[file] = require(`./commands/${file}`);
    }
  }
});

// Cache all triggers.
cachedTriggers = [];

data.readWarnings();
data.readBans();

// Load custom responses
if (process.env.DATA_CUSTOM_RESPONSES) {
  data.readCustomResponses();
}

client.login(process.env.DISCORD_LOGIN_TOKEN);
logger.info('Startup completed. Established connection to Discord.');
