exports.roles = ['Admins', 'Moderators', 'CitraBot'];
exports.command = function (message) {
  var role = '417319307844780034';
  message.mentions.users.map((user) => {
    let member = message.guild.member(user);
    let alreadyJoined = member.roles.has(role);

    if (alreadyJoined) {
      member.removeRole(role);
      message.channel.sendMessage(`${user} was revoked of authorization.`);
    } else {
      member.addRole(role);
      message.channel.sendMessage(`${user} is now authorized.`);
    }
  });
}
