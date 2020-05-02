import state from '../state';
import UserBan from '../models/UserBan';
import UserWarning from '../models/UserWarning';
import discord = require('discord.js');

export const roles = ['Admins', 'Moderators'];

function formatWarnings (warnings: UserWarning[]) {
  return warnings.map(x => `[${x.date}] ${x.warnedByUsername} warned ${x.username} [${x.priorWarnings} + 1]. ${x.silent ? '(silent)' : ''} ${x.cleared ? '(cleared)' : ''}`);
}

function formatBans (bans: UserBan[]) {
  return bans.map(x => `[${x.date}] ${x.warnedByUsername} banned ${x.username} [${x.priorWarnings} + 1].`);
}

export function command (message: discord.Message) {
  message.mentions.users.map((user) => {
    const totalWarnings = state.warnings.filter(x => x.id === user.id && x.cleared === false).length;
    const warns = state.warnings.filter(x => x.id === user.id);
    const bans = state.bans.filter(x => x.id === user.id);

    const warnsString = `Warns: \`\`\`${formatWarnings(warns).join('\n')}\`\`\``;
    const bansString = `Bans: \`\`\`${formatBans(bans).join('\n')}\`\`\``;

    message.channel.send(`\`${user.username} (${totalWarnings}) information:\`${warns.length !== 0 ? warnsString : ''}${bans.length !== 0 ? bansString : ''}`);
  });
};
