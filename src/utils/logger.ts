import { debuglog } from 'util';

const debugLogger = (msg: string) => {
  debuglog('debug')(msg);
  debuglog('warn')(msg);
  debuglog('verbose')(msg);
};
const warnLogger = (msg: string) => {
  debuglog('warn')(msg);
  debuglog('verbose')(msg);
};
const verboseLogger = (msg: string) => {
  debuglog('verbose')(msg);
};

const logger = {
  debug: debugLogger,
  verbose: verboseLogger,
  warn: warnLogger,
};

export { logger };
