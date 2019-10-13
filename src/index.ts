import { listRuntimeDependencies } from './listRuntimeDependencies';
import { parseArgs } from './parseArgs';
import { arrayContains } from './utils';
import { validatePeerDependencies } from './validatePeerDependencies';

// tslint:disable-next-line: no-floating-promises
(async () => {
  const listRuntimeDeps = ['listRuntimeDeps', 'lrd'];
  const validatePeerDeps = ['validatePeerDeps', 'vpd'];
  const args = parseArgs({ listRuntimeDeps, validatePeerDeps });

  if (!args) {
    return;
  }

  // not sure how this gets typed with yargs
  if (arrayContains(args.command, listRuntimeDeps)) {
    const { folders } = (args as unknown) as {
      [key: string]: string[];
    };

    await listRuntimeDependencies(folders);
  }

  // not sure how this gets typed with yargs
  if (arrayContains(args.command, validatePeerDeps)) {
    const { logMissing, logUnmet, throwMissing, throwUnmet } = (args as unknown) as {
      [key: string]: boolean;
    };

    await validatePeerDependencies(logMissing, logUnmet, throwMissing, throwUnmet);
  }
})();
