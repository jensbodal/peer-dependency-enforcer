import { listRuntimeDependencies } from './listRuntimeDependencies';
import { parseArgs } from './parseArgs';
import { arrayContains, getPackageJson } from './utils';
import { validatePeerDependencies } from './validatePeerDependencies';

// tslint:disable-next-line: no-floating-promises
(async () => {
  const listRuntimeDeps = ['listRuntimeDeps', 'lrd'];
  const validateInstalledDeps = ['validateInstalledDeps', 'vid'];
  const validatePeerDeps = ['validatePeerDeps', 'vpd'];
  const args = parseArgs({ listRuntimeDeps, validateInstalledDeps, validatePeerDeps });

  // if no args then our help will print and this exits
  if (!args) {
    return;
  }

  // not sure how this gets typed with yargs
  if (arrayContains(args.command, listRuntimeDeps)) {
    const { folders } = (args as unknown) as {
      [key: string]: string[];
    };

    const runtimeDependencies = await listRuntimeDependencies(folders);

    console.log('Your non-1st-party runtime dependencies');
    console.log(runtimeDependencies);
  }

  // not sure how this gets typed with yargs
  if (arrayContains(args.command, validateInstalledDeps)) {
    const { folders, withDevDependencies } = (args as unknown) as {
      [key: string]: string[];
    };

    const runtimeDependencies = await listRuntimeDependencies(folders);
    const runtimeDependenciesSet = new Set(runtimeDependencies);

    const { dependencies, devDependencies, peerDependencies } = getPackageJson();

    const installed: string[] = [];
    const installedTwice: string[] = [];
    const missing: string[] = [];
    const suggestedPeerDependencies: string[] = [];
    const invalidDependencies: string[] = [];
    const invalidDevDependencies: string[] = [];

    for (const dep of runtimeDependencies) {
      let installCount = 0;

      if (dependencies.hasOwnProperty(dep)) {
        installed.push(dep);
        installCount++;
      }

      if (devDependencies.hasOwnProperty(dep)) {
        installed.push(dep);
        installCount++;

        // if runtime dependency and only installed as dev dependency then
        // it should be a peerDependency as well
        if (!peerDependencies.hasOwnProperty(dep)) {
          suggestedPeerDependencies.push(dep);
        }
      }

      if (installCount === 0) {
        missing.push(dep);
      } else if (installCount > 1) {
        installedTwice.push(dep);
      }
    }

    for (const dep of Object.keys(dependencies)) {
      if (!runtimeDependenciesSet.has(dep)) {
        invalidDependencies.push(dep);
      }
    }

    for (const dep of Object.keys(devDependencies)) {
      if (!runtimeDependenciesSet.has(dep)) {
        invalidDevDependencies.push(dep);
      }
    }

    let throwError = 0;

    if (installed.length > 0) {
      console.log(`Installed runtime dependencies:\n  - ${installed.join('\n  - ')}`);
    }

    if (installedTwice.length > 0) {
      console.log(`Runtime dependencies installed twice:\n  - ${installedTwice.join('\n  - ')}`);
      throwError += 2;
    }

    if (missing.length > 0) {
      console.log(`Missing dependencies in your package.json:\n  - ${missing.join('\n  - ')}`);
      throwError += 2;
    }

    if (invalidDependencies.length > 0) {
      console.log(
        `Invalid dependencies (non-runtime dependency, should be moved to devDependencies or removed):\n  - ${invalidDependencies.join(
          '\n  - '
        )}`
      );
      throwError += 2;
    }

    if (withDevDependencies) {
      // Too verbose, need to work on where it scans
      if (invalidDevDependencies.length > 0) {
        console.log(
          `Potentially invalid devDependencies (possibly used outside of scanned folders or extensions):\n  - ${invalidDevDependencies.join(
            '\n  - '
          )}`
        );
        throwError += 2;
      }
    } else {
      console.log('Not currently checking for invalid devDependencies');
    }

    // This is also suggesting test dependencies, test dependencies should be removed from runtime dependencies
    if (suggestedPeerDependencies.length > 0) {
      console.log(
        `Runtime devDependencies not declared as peerDependencies:\n  - ${suggestedPeerDependencies.join('\n  - ')}`
      );
    }

    if (throwError > 0) {
      process.exit(throwError);
    }
  }

  // not sure how this gets typed with yargs
  if (arrayContains(args.command, validatePeerDeps)) {
    const { logMissing, logTransient, logUnmet, throwMissing, throwTransient, throwUnmet } = (args as unknown) as {
      [key: string]: boolean;
    };

    await validatePeerDependencies(logMissing, logTransient, logUnmet, throwMissing, throwTransient, throwUnmet);
  }
})();
