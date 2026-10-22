const { EventEmitter } = require('node:events');
const childProcess = require('node:child_process');

const realExec = childProcess.exec;

function isNetUseCommand(command) {
  return typeof command === 'string' && command.trim().toLowerCase() === 'net use';
}

childProcess.exec = function patchedExec(command, options, callback) {
  if (isNetUseCommand(command)) {
    const cb = typeof options === 'function' ? options : callback;
    const fakeChild = new EventEmitter();
    fakeChild.pid = 0;
    fakeChild.stdout = null;
    fakeChild.stderr = null;
    fakeChild.kill = () => false;

    if (cb) {
      process.nextTick(() => cb(null, '', ''));
    }

    process.nextTick(() => {
      fakeChild.emit('exit', 0);
      fakeChild.emit('close', 0);
    });

    return fakeChild;
  }

  return realExec.call(this, command, options, callback);
};

module.exports = {};
