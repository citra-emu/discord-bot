import fetch from 'node-fetch';
import discord = require('discord.js');

const fetchOptions = {
  headers: { 'User-Agent': 'Citra-Emu/CitraBot (Node.js)', 'Accept': 'application/vnd.github.antiope-preview+json' }
};
const repo = process.env.GITHUB_REPOSITORY || 'citra-emu/citra';

export const roles = ['Admins', 'Moderators', 'Developer'];
export function command(message: discord.Message) {
  const pr_number = message.content.substr(message.content.indexOf(' ') + 1).replace(/\n/g, '');
  const url = `https://api.github.com/repos/${repo}/pulls/${pr_number}`;
  fetch(url, fetchOptions).then(response => response.json()).then(pr => {
    if (!pr || pr.documentation_url || !pr.head) throw new Error('PR not found');
    const headSHA = pr.head.sha;
    // use the new GitHub checks API
    fetch(`https://api.github.com/repos/${repo}/commits/${headSHA}/check-runs`, fetchOptions).then(response => response.json()).then(statuses => {
      if (!statuses.check_runs || statuses.total_count < 1) throw new Error('No check runs');
      let msg = new discord.MessageEmbed().setTitle(`Status for PR #${pr_number}`).setURL(pr.html_url);
      let color = 'GREEN';
      statuses.check_runs.forEach((run: any) => {
        msg.addField(`${run.name}`, `**[${run.status} ${run.conclusion}](${run.html_url})**`);
        if (run.conclusion !== 'success') color = 'RED';
      });
      msg.setColor(color);
      message.channel.send(msg);
    }).catch(() => {
      message.channel.send('I wasn\'t able to get the status of that PR...')
    });
  }).catch(() => {
    message.channel.send('No such PR.');
  });
}
