import UserWarning from './models/UserWarning';
import UserBan from './models/UserBan';
import { IGameDBEntry } from './models/interfaces';
import discord = require('discord.js');

/* Application State */
class State {
  logChannel: discord.TextChannel | discord.DMChannel;
  msglogChannel: discord.TextChannel | discord.DMChannel;
  warnings: UserWarning[];
  responses: any;
  bans: UserBan[];
  stats: { joins: number; ruleAccepts: number; leaves: number; warnings: number; };
  lastGameDBUpdate: number;
  gameDB: IGameDBEntry[];
  gameDBPromise: Promise<void>;

  constructor () {
    this.logChannel = null;
    this.msglogChannel = null;
    this.warnings = [];
    this.responses = null;
    this.bans = [];
    this.stats = {
      joins: 0,
      ruleAccepts: 0,
      leaves: 0,
      warnings: 0
    };
    this.lastGameDBUpdate = 0;
    this.gameDB = [];
    this.gameDBPromise = null;
  }
}

export default new State();
