import { parseArgs } from "./parseArgs";
import { validatePeerDependencies } from "./validatePeerDependencies";
import { arrayContains } from "./util";

(async () => {
  const validatePeerDeps = ["validatePeerDeps", "vpd"];
  const args = parseArgs({ validatePeerDeps });

  if (!args) {
    return;
  }

  // not sure how this gets typed with yargs
  if (arrayContains(args.command, validatePeerDeps)) {
    const {
      logMissing,
      logUnmet,
      throwMissing,
      throwUnmet
    } = (args as unknown) as {
      [key: string]: boolean;
    };

    await validatePeerDependencies(logMissing, logUnmet, throwMissing, throwUnmet);
  }
})();
