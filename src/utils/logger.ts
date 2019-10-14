import { debuglog } from 'util';

const debugLogger = debuglog('debug');
const warnLogger = debuglog('warn');
const verboseLogger = debuglog('verbose');

const logger = {
  debug: debugLogger,
  verbose: verboseLogger,
  warn: warnLogger,
};

export { logger };
