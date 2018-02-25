exports.command = function (message) {
  var role = '417319307844780034';
  let alreadyJoined = message.member.roles.has(role);

  if (!alreadyJoined) {
    message.member.addRole(role);
  }
}
