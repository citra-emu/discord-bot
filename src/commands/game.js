const request = require('request');
const discord = require('discord.js');
const stringSimilarity = require('string-similarity');

const logger = require('../logging.js');
const state = require('../state.js');

const targetServer = process.env.COMPAT_DB_SOURCE;
const refreshTime = process.env.COMPAT_REFRESH_TIME ? parseInt(process.env.COMPAT_REFRESH_TIME) : 1000 * 60 * 20;
const iconBase = process.env.COMPAT_ICON_BASE;
const urlBase = process.env.COMPAT_URL_BASE;

const compatStrings = {
  0: { "key": "0", "name": "Perfect", "color": "#5c93ed", "description": "Game functions flawless with no audio or graphical glitches, all tested functionality works as intended without any workarounds needed." },
  1: { "key": "1", "name": "Great", "color": "#47d35c", "description": "Game functions with minor graphical or audio glitches and is playable from start to finish. May require some workarounds." },
  2: { "key": "2", "name": "Okay", "color": "#94b242", "description": "Game functions with major graphical or audio glitches, but game is playable from start to finish with workarounds." },
  3: { "key": "3", "name": "Bad", "color": "#f2d624", "description": "Game functions, but with major graphical or audio glitches. Unable to progress in specific areas due to glitches even with workarounds." },
  4: { "key": "4", "name": "Intro/Menu", "color": "red", "description": "Game is completely unplayable due to major graphical or audio glitches. Unable to progress past the Start Screen." },
  5: { "key": "5", "name": "Won't Boot", "color": "#828282", "description": "The game crashes when attempting to startup." },
  99: { "key": "99", "name": "Not Tested", "color": "black", "description": "The game has not yet been tested." }
};

exports.command = function (message) {
  if (Date.now() - state.lastGameDBUpdate > refreshTime) {
    // Update remote list of games locally.
    const waitMessage = message.channel.send("This will take a second...");

    request(targetServer, function (error, response, body) {
      // We don't need this message anymore
      waitMessage.then(waitMessageResult => waitMessageResult.delete());

      if (!error && response.statusCode === 200) {
        state.gameDB = JSON.parse(body);
        state.lastGameDBUpdate = Date.now();
        logger.info(`Updated games list (${state.gameDB.length} games)`);

        exports.command(message);
      } else {
        logger.error("Unable to download latest games list!");
        message.channel.send("Game compatibility feed temporally unavailable - sorry!")
      }
    });

    return;
  }

  const game = message.content.substr(message.content.indexOf(' ') + 1);

  // Search all games. This is only linear time, so /shrug?
  let bestGame = undefined;
  let bestScore = 0.5; // Game names must have at least a 50% similarity to be matched

  state.gameDB.forEach(testGame => {
    const newDistance = stringSimilarity.compareTwoStrings(game.toLowerCase(), testGame.title.toLowerCase());
    if (newDistance > bestScore) {
      bestGame = testGame;
      bestScore = newDistance;
    }
  });

  if (bestGame === undefined) {
    message.channel.send("Game could not be found.");
    return;
  }

  const screenshot = `${iconBase}${bestGame.id}.png`;
  const url = `${urlBase}${bestGame.id}/`;

  const compat = compatStrings[bestGame.compatibility];

  const embed = new discord.RichEmbed()
    .addField("Status", compat.name, true)
    .addField("Needs System Files", bestGame.needs_system_files ? "Yes" : "No", true)
    .addField("Needs Shared Font", bestGame.needs_shared_font ? "Yes" : "No", true)
    .setTitle(bestGame.title)
    .setColor(compat.color)
    .setDescription(bestGame.description)
    .setURL(url)
    .setThumbnail(screenshot);

  message.channel.send(embed);
};
