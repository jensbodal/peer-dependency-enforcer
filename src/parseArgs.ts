import { DEFAULT_EXTENSIONS, DEFAULT_IGNORE_DIRS, DEFAULT_IGNORE_MODULE_PREFIX } from '@/listRuntimeDependencies';
import yargs from 'yargs';

const parseArgs = ({ listRuntimeDeps, validateInstalledDeps, validatePeerDeps }: { [key: string]: string[] }) => {
  // yargs configuration happens statically
  // tslint:disable-next-line: no-unused-expression
  yargs
    .strict()
    .command(listRuntimeDeps, '(list all non-1st-party runtime dependencies)', yargs => {
      yargs.options({
        extension: {
          coerce: (args: string[]) => {
            const newArgs: string[] = [];
            for (const arg of args) {
              newArgs.push(...arg.split(','));
            }
            return newArgs;
          },
          desc: `Override extensions that are parsed (Default: "${DEFAULT_EXTENSIONS.join('","')}")`,
          type: 'array',
        },
        folders: {
          alias: 'f',
          coerce: (args: string[]) => {
            const newArgs: string[] = [];
            for (const arg of args) {
              newArgs.push(...arg.split(','));
            }
            return newArgs;
          },
          demandOption: true,
          desc: 'Folders to scan for dependencies (e.g. "src,test")',
          // alllow -f a,b (no space between items in array)
          type: 'array',
        },
        ignoreDir: {
          alias: ['ignore'],
          coerce: (args: string[]) => {
            const newArgs: string[] = [];
            for (const arg of args) {
              newArgs.push(...arg.split(','));
            }
            return newArgs;
          },
          desc: `Additional directories to not scan (Default: "${DEFAULT_IGNORE_DIRS.join('","')}")`,
          type: 'array',
        },
        ignoreModulePrefix: {
          coerce: (args: string[]) => {
            const newArgs: string[] = [];
            for (const arg of args) {
              newArgs.push(...arg.split(','));
            }
            return newArgs;
          },
          desc: `Module prefixes to ignore, useful if setting custom paths in tsconfig (Default: "${DEFAULT_IGNORE_MODULE_PREFIX.join(
            '","'
          )}")`,
          type: 'array',
        },
        includeExtension: {
          coerce: (args: string[]) => {
            const newArgs: string[] = [];
            for (const arg of args) {
              newArgs.push(...arg.split(','));
            }
            return newArgs;
          },
          desc: `Additional extensions to search for (Default: "${DEFAULT_EXTENSIONS.join('","')}")`,
          type: 'array',
        },
        modulePrefix: {
          coerce: (args: string[]) => {
            const newArgs: string[] = [];
            for (const arg of args) {
              newArgs.push(...arg.split(','));
            }
            return newArgs;
          },
          desc: `Override module prefixes that are ignored (Default: "${DEFAULT_IGNORE_MODULE_PREFIX.join('","')}")`,
          type: 'array',
        },
        withBuild: {
          default: false,
          desc: 'Include folders called "build" in scans',
          type: 'boolean',
        },
        withBuiltIn: {
          default: false,
          desc: 'Include in module listings folders in the core node module',
          type: 'boolean',
        },
      });
    })
    .command(validateInstalledDeps, 'validate all installed and used dependencies', yargs => {
      yargs.options({
        extension: {
          coerce: (args: string[]) => {
            const newArgs: string[] = [];
            for (const arg of args) {
              newArgs.push(...arg.split(','));
            }
            return newArgs;
          },
          desc: `Override extensions that are parsed (Default: "${DEFAULT_EXTENSIONS.join('","')}")`,
          type: 'array',
        },
        folders: {
          alias: 'f',
          coerce: (args: string[]) => {
            const newArgs: string[] = [];
            for (const arg of args) {
              newArgs.push(...arg.split(','));
            }
            return newArgs;
          },
          demandOption: true,
          desc: 'Folders to scan for dependencies (e.g. "src,test")',
          // alllow -f a,b (no space between items in array)
          type: 'array',
        },
        ignoreDir: {
          alias: ['ignore'],
          coerce: (args: string[]) => {
            const newArgs: string[] = [];
            for (const arg of args) {
              newArgs.push(...arg.split(','));
            }
            return newArgs;
          },
          desc: `Additional directories to not scan (Default: "${DEFAULT_IGNORE_DIRS.join('","')}")`,
          type: 'array',
        },
        ignoreModulePrefix: {
          coerce: (args: string[]) => {
            const newArgs: string[] = [];
            for (const arg of args) {
              newArgs.push(...arg.split(','));
            }
            return newArgs;
          },
          desc: `Module prefixes to ignore, useful if setting custom paths in tsconfig (Default: "${DEFAULT_IGNORE_MODULE_PREFIX.join(
            '","'
          )}")`,
          type: 'array',
        },
        includeExtension: {
          coerce: (args: string[]) => {
            const newArgs: string[] = [];
            for (const arg of args) {
              newArgs.push(...arg.split(','));
            }
            return newArgs;
          },
          desc: `Additional extensions to search for (Default: "${DEFAULT_EXTENSIONS.join('","')}")`,
          type: 'array',
        },
        modulePrefix: {
          coerce: (args: string[]) => {
            const newArgs: string[] = [];
            for (const arg of args) {
              newArgs.push(...arg.split(','));
            }
            return newArgs;
          },
          desc: `Override module prefixes that are ignored (Default: "${DEFAULT_IGNORE_MODULE_PREFIX.join('","')}")`,
          type: 'array',
        },
        withBuild: {
          default: false,
          desc: 'Include folders called "build" in scans',
          type: 'boolean',
        },
        withBuiltIn: {
          default: false,
          desc: 'Include in module listings folders in the core node module',
          type: 'boolean',
        },
        withDevDeps: {
          alias: ['withDevDependencies', 'withDev'],
          default: false,
          desc: 'Include validation against declared devDependencies',
          type: 'boolean',
        },
      });
    })
    .command(validatePeerDeps, '(validate your peer dependency requirements)', yargs => {
      yargs.options({
        logMissing: {
          default: true,
          desc: 'Log to console any missing peer dependencies',
          type: 'boolean',
        },
        logTransient: {
          default: true,
          desc: 'Log to console any direct peer dependencies that have been installed indirectly',
          type: 'boolean',
        },
        logUnmet: {
          default: true,
          desc: 'Log to console any unmet peer dependencies',
          type: 'boolean',
        },
        throwMissing: {
          default: true,
          desc: 'Throw error if there are missing peer dependencies',
          type: 'boolean',
        },
        throwTransient: {
          default: true,
          desc: 'Throw error if there are direct peer dependencies that have been installed indirectly',
          type: 'boolean',
        },
        throwUnmet: {
          default: false,
          desc: 'Throw error if there are unmet peer dependencies',
          type: 'boolean',
        },
      });
    })
    .wrap(yargs.terminalWidth()).argv;

  if (yargs.argv._.length === 0) {
    yargs.showHelp();
    return false;
  }

  return {
    ...yargs.argv,
    command: yargs.argv._,
  };
};

export { parseArgs };
