exports.roles = ['Admins', 'Moderators', 'CitraBot'];
exports.command = function (message) {
  const role = process.env.DISCORD_DEVELOPER_ROLE;
  message.mentions.users.map((user) => {
    let member = message.guild.member(user);
    let alreadyJoined = member.roles.has(role);

    if (alreadyJoined) {
      member.removeRole(role);
      message.channel.send(`${user}'s speech has been revoked in the #development channel.`);
    } else {
      member.addRole(role);
      message.channel.send(`${user} has been granted speech in the #development channel.`);
    }
  });
};
