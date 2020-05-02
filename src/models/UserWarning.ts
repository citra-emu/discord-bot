class UserWarning {
  id: string;
  username: string;
  date: Date;
  warnedBy: string;
  warnedByUsername: string;
  priorWarnings: number;
  silent: boolean;
  cleared: boolean;

  constructor (id: string, username: string, warnedBy: string, warnedByUsername: string, priorWarnings: number, silent: boolean) {
    this.id = id;
    this.username = username;
    this.date = new Date();
    this.warnedBy = warnedBy;
    this.warnedByUsername = warnedByUsername;
    this.priorWarnings = priorWarnings;
    this.silent = silent;
    this.cleared = false;
  }
}

export default UserWarning;
