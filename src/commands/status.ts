import fetch from 'node-fetch';
import discord = require('discord.js');

const fetchOptions = {
  headers: { 'User-Agent': 'Citra-Emu/CitraBot (Node.js)' }
};
const repo = process.env.GITHUB_REPOSITORY || 'citra-emu/citra';

export const roles = ['Admins', 'Moderators', 'Developers'];
export function command(message: discord.Message) {
  const pr = message.content.substr(message.content.indexOf(' ') + 1).replace(/\n/g, '');
  const url = `https://api.github.com/repos/${repo}/pulls/${pr}`;
  fetch(url, fetchOptions).then(response => response.json()).then(pr => {
    if (pr.documentation_url) throw new Error('PR not found');
    fetch(pr.statuses_url, fetchOptions).then(response => response.json()).then(statuses => {
      if (statuses.length === 0) return;
      // Travis CI will give you multiple, identical target URLs so we might as well just check the first one...
      const status = statuses[0];
      status.target_url = status.target_url.substr(0, status.target_url.indexOf('?'));
      message.channel.send(`${status.context}: ${status.target_url}: **${status.state}**`);
    }).catch(() => {
      message.channel.send('I wasn\'t able to get the status of that PR...')
    });
  }).catch(() => {
    message.channel.send('No such PR.');
  });
}
