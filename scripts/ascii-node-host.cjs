const os = require('os');

os.hostname = () => 'local';
os.userInfo = () => ({
  username: 'jiuyi777',
  uid: -1,
  gid: -1,
  shell: null,
  homedir: process.env.USERPROFILE || process.cwd(),
});

process.env.COMPUTERNAME = 'local';
process.env.USERDOMAIN = 'local';
process.env.USERDOMAIN_ROAMINGPROFILE = 'local';
process.env.USERNAME = 'jiuyi777';
process.env.LOGONSERVER = '\\\\local';
