const state = require('../state.js');
exports.roles = ['Admins', 'Moderators'];

function formatWarnings(warnings) {
  return warnings.map(x => `[${x.date}] ${x.warnedByUsername} warned ${x.username} [${x.priorWarnings} + 1]. ${x.silent ? '(silent)' : ''} ${x.cleared ? '(cleared)' : ''}`)
}

function formatBans(bans) {
  return bans.map(x => `[${x.date}] ${x.warnedByUsername} banned ${x.username} [${x.priorWarnings} + 1].`)
}

exports.command = function (message) {
  message.mentions.users.map((user) => {
    const totalWarnings = state.warnings.filter(x => x.id === user.id && x.cleared == false).length;
    let warns = state.warnings.filter(x => x.id == user.id)
    let bans = state.bans.filter(x => x.id == user.id)

    const warnsString = `Warns: \`\`\`${formatWarnings(warns).join('\n')}\`\`\``
    const bansString = `Bans: \`\`\`${formatBans(bans).join('\n')}\`\`\``

    message.channel.send(`\`${user.username} (${totalWarnings}) information:\`${warns.length != 0 ? warnsString : ''}${bans.length != 0 ? bansString : ''}`)
  });
}
