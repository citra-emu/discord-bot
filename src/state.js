/* Application State */
const State = function () {
  this.guild = null;
  this.logChannel = null;
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
};

module.exports = new State();
