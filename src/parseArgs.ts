import yargs from "yargs";

const parseArgs = ({validatePeerDeps}: {[key: string]: string[]}) => {

  yargs
    .strict()
    .command(
      validatePeerDeps,
      "(validate your peer dependency requirements)",
      yargs => {
        yargs.options({
          logMissing: {
            type: "boolean",
            desc: "Log to console any missing peer dependencies",
            default: true
          },
          logUnmet: {
            type: "boolean",
            desc: "Log to console any unmet peer dependencies",
            default: true
          },
          throwMissing: {
            type: "boolean",
            desc: "Throw error if there are missing peer dependencies",
            default: true
          },
          throwUnmet: {
            type: "boolean",
            desc: "Throw error if there are unmet peer dependencies",
            default: false
          }
        });
      }
    )
    .wrap(yargs.terminalWidth())
    .argv;

  if (yargs.argv._.length === 0) {
    yargs.showHelp();
    return false;
  }

  return {
    ...yargs.argv,
    command: yargs.argv._
  }
};

export { parseArgs };
