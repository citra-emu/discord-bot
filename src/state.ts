import UserWarning from './models/UserWarning';
import UserBan from './models/UserBan';
import { IGameDBEntry, IResponses } from './models/interfaces';
import discord = require('discord.js');

/* Application State */
class State {
  logChannel: discord.TextChannel | discord.DMChannel;
  msglogChannel: discord.TextChannel | discord.DMChannel;
  userlogChannel: discord.TextChannel | discord.DMChannel;
  warnings: UserWarning[];
  responses: IResponses;
  bans: UserBan[];
  stats: { joins: number; ruleAccepts: number; leaves: number; warnings: number; };
  lastGameDBUpdate: number;
  gameDB: IGameDBEntry[];
  gameDBPromise: Promise<void> | null;

  constructor () {
    this.logChannel;
    this.msglogChannel;
    this.userlogChannel;
    this.warnings = [];
    this.responses;
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
