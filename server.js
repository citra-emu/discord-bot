var discord = require('discord.js');
var fs = require('fs');
var path = require('path');

var config = require('./config.json');
var logger = require('./logging.js');
var app = require('./app.js');
var data = require('./data.js');

var cachedModules = [];
var cachedTriggers = [];
var client = new discord.Client();

function findArray(haystack, arr) {
    return arr.some(function (v) {
        return haystack.indexOf(v) >= 0;
    });
};

client.on('ready', () => {
  // Initalize app channels.
  app.logChannel = client.channels.get(config.logChannel);
  app.guild = app.logChannel.guild;

  logger.info('Bot is now online and connected to server.');
});

client.on('message', message => {
  if (message.author.bot && message.content.startsWith('.ban') == false) { return; }

  if (message.guild == null) {
    // We want to log PM attempts.
    logger.info(`${message.author.username} ${message.author} [PM]: ${message.content}`);
    app.logChannel.sendMessage(`${message.author} [PM]: ${message.content}`);
    message.reply(config.pmReply);
    return;
  }

  logger.verbose(`${message.author.username} ${message.author} [Channel: ${message.channel}]: ${message.content}`);

  if (message.content.startsWith(config.commandPrefix)) {
    let cmd = message.content.split(' ')[0].slice(1);

    // Check by the name of the command.
    let cachedModule = cachedModules[`${cmd}.js`];
    let cachedModuleType = 'Command';
    // Check by the quotes in the configuration.
    if (cachedModule == null) { cachedModule = config.quotes[cmd]; cachedModuleType = 'Quote'; }

    if (cachedModule) {
      // Check access permissions.
      if (cachedModule.roles != undefined && findArray(message.member.roles.map(function(x) { return x.name; }), cachedModule.roles) == false) {
        app.logChannel.sendMessage(`${message.author} attempted to use admin command: ${message.content}`);
        logger.info(`${message.author.username} ${message.author} attempted to use admin command: ${message.content}`)
        return false;
      }

      logger.info(`${message.author.username} ${message.author} [Channel: ${message.channel}] executed command: ${message.content}`);
      message.delete();

      try {
        if (cachedModuleType == 'Command') {
          cachedModule.command(message);
        } else if (cachedModuleType == 'Quote') {
          cachedModules['quote.js'].command(message, cachedModule.reply);
        }
      } catch (err) { logger.error(err); }

      try {
        // Check if the command requires a warning.
        if (cmd != 'warn' && cachedModule.warn == true) {
          cachedModules['warn.js'].command(message);
        }
      } catch (err) { logger.error(err); }
    } else {
      // Not a valid command.
    }
  } else if (message.author.bot == false) {
    // This is a normal channel message.
    cachedTriggers.forEach(function(trigger) {
        if (trigger.roles == undefined || findArray(message.member.roles.map(function(x) { return x.name; }), trigger.roles)) {
          if (trigger.trigger(message) == true) {
              logger.info(`${message.author.username} ${message.author} [Channel: ${message.channel}] triggered: ${message.content}`);
              try {
                trigger.execute(message);
              } catch (err) { logger.error(err); }
          }
        }
    });
  }
});

// Cache all command modules.
cachedModules = [];
require("fs").readdirSync('./commands/').forEach(function(file) {
  // Load the module if it's a script.
  if (path.extname(file) == '.js') {
    logger.info(`Loaded module: ${file}`);
    cachedModules[file] = require(`./commands/${file}`);
  }
});

// Cache all triggers.
cachedTriggers = [];
require("fs").readdirSync('./triggers/').forEach(function(file) {
  // Load the trigger if it's a script.
  if (path.extname(file) == '.js') {
    logger.info(`Loaded trigger: ${file}`);
    cachedTriggers.push(require(`./triggers/${file}`));
  }
});

data.readWarnings();
data.readBans();
logger.info('Startup completed.');

client.login(config.clientLoginToken);
