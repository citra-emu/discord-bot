class UserBan {
  id: string;
  username: string;
  date: Date;
  warnedBy: string;
  warnedByUsername: string;
  priorWarnings: number;

  constructor (id: string, username: string, warnedBy: string, warnedByUsername: string, priorWarnings: number) {
    this.id = id;
    this.username = username;
    this.date = new Date();
    this.warnedBy = warnedBy;
    this.warnedByUsername = warnedByUsername;
    this.priorWarnings = priorWarnings;
  }
}

export default UserBan;
