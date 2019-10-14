import yargs from 'yargs';

const parseArgs = ({ listRuntimeDeps, validateInstalledDeps, validatePeerDeps }: { [key: string]: string[] }) => {
  // yargs configuration happens statically
  // tslint:disable-next-line: no-unused-expression
  yargs
    .strict()
    .command(listRuntimeDeps, '(list all non-1st-party runtime dependencies)', yargs => {
      yargs.options({
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
          desc: 'Array of folders to scan',
          // alllow -f a,b (no space between items in array)
          type: 'array',
        },
      });
    })
    .command(validateInstalledDeps, 'validate all installed and used dependencies', yargs => {
      yargs.options({
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
          desc: 'Array of folders to scan for dependencies',
          // alllow -f a,b (no space between items in array)
          type: 'array',
        },
        withDevDeps: {
          alias: 'withDevDependencies',
          default: true,
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
