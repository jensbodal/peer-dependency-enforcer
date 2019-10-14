import { getPackageJson } from '@/utils';
import { existsSync, readdirSync } from 'fs';
import { resolve as resolvePath } from 'path';
import { satisfies, validRange } from 'semver';

enum Errors {
  UNMET = 1,
  TRANSIENT = 2,
  MISSING = 4,
  UNMET_TRANSIENT = 3,
  UNMET_MISSING = 5,
  TRANSIENT_MISSING = 6,
  UNMET_TRANSIENT_MISSING = 7,
}

const setupErrorHandler = (throwUnmet: boolean, throwTransient: boolean, throwMissing: boolean) => {
  process.on('exit', code => {
    switch (code) {
      case Errors.UNMET:
        if (throwUnmet) {
          throw Error('Unmet peer dependencies!');
        }
        break;
      case Errors.TRANSIENT:
        if (throwTransient) {
          throw Error('Some direct peer dependencies are installed indirectly!');
        }
      case Errors.MISSING:
        if (throwMissing) {
          throw Error('Missing peer dependencies!');
        }
        break;
      case Errors.UNMET_TRANSIENT:
        if (throwTransient || throwUnmet) {
          throw Error('Both unmet and indirectly installed peer dependencies!');
        }
        break;
      case Errors.UNMET_MISSING:
        if (throwMissing || throwUnmet) {
          throw Error('Both missing and unmet peer dependencies!');
        }
        break;
      case Errors.TRANSIENT_MISSING:
        if (throwMissing || throwTransient) {
          throw Error('Both missing and indirectly installed peer dependencies!');
        }
        break;

      case Errors.UNMET_TRANSIENT_MISSING:
        if (throwUnmet || throwTransient || throwMissing) {
          throw Error(
            'Found unmet peer dependencies, peer dependencies installed indirectly, and missing peer dependencies!'
          );
        }
    }

    process.exit(0);
  });
};

const validatePeerDependencies = async (
  LOG_MISSING: boolean,
  LOG_TRANSIENT: boolean,
  LOG_UNMET: boolean,
  THROW_MISSING: boolean,
  THROW_TRANSIENT: boolean,
  THROW_UNMET: boolean
) => {
  setupErrorHandler(THROW_UNMET, THROW_TRANSIENT, THROW_MISSING);
  const APP_DIR = '.';

  const findPackageJsonPaths = async (root: string, packageJsonPaths: string[] = []): Promise<string[]> => {
    const packageFolders = readdirSync(root);

    for (const packageFolder of packageFolders) {
      // ignore .bin .cache and other hidden folders
      if (packageFolder.startsWith('.')) {
        continue;
      }

      const path = `${root}/${packageFolder}`;
      const packageJsonPath = `${path}/package.json`;

      // if package.json doesn't exist, we are probably in a scope folder (e.g. @babel)
      if (!existsSync(packageJsonPath)) {
        await findPackageJsonPaths(path, packageJsonPaths);
        continue;
      }

      packageJsonPaths.push(packageJsonPath);
    }

    return packageJsonPaths;
  };

  const createDependencyMaps = async (packageJsonPaths: string[]) => {
    const dependencyMap: {
      [dependencyName: string]: Array<{
        name: string;
        path: string;
        version: string;
      }>;
    } = {};

    const peerDependencyMap: {
      [peerDependencyName: string]: Array<{
        name: string;
        path: string;
        version: string;
      }>;
    } = {};

    for (const path of packageJsonPaths) {
      const packageJson = getPackageJson(resolvePath(path));

      if (!packageJson.peerDependencies) {
        continue;
      }

      for (const peerDependency of Object.keys(packageJson.peerDependencies)) {
        if (
          // skip any peerDependencies which are declared optional
          packageJson.peerDependenciesMeta &&
          packageJson.peerDependenciesMeta[peerDependency] &&
          packageJson.peerDependenciesMeta[peerDependency].optional
        ) {
          continue;
        }

        if (!peerDependencyMap.hasOwnProperty(peerDependency)) {
          peerDependencyMap[peerDependency] = [];
        }

        peerDependencyMap[peerDependency].push({
          name: packageJson.name,
          path,
          version: packageJson.peerDependencies[peerDependency],
        });
      }
    }

    for (const path of packageJsonPaths) {
      const packageJson = getPackageJson(resolvePath(path));

      if (!packageJson.dependencies) {
        continue;
      }

      for (const dependency of Object.keys(packageJson.dependencies)) {
        if (!dependencyMap.hasOwnProperty(dependency)) {
          dependencyMap[dependency] = [];
        }

        dependencyMap[dependency].push({
          name: packageJson.name,
          path,
          version: packageJson.dependencies[dependency],
        });
      }
    }

    return { dependencyMap, peerDependencyMap };
  };

  const packageJsonPaths = await findPackageJsonPaths(`${APP_DIR}/node_modules`);
  const { dependencyMap, peerDependencyMap } = await createDependencyMaps(packageJsonPaths);
  const rootPackageJson = getPackageJson();

  const missingDependencies: string[] = [];
  const unmetDependencies: string[] = [];
  const transientDependencies: string[] = [];

  for (const peerDependencyName of Object.keys(peerDependencyMap)) {
    const packagePathIdx = packageJsonPaths.findIndex(
      path =>
        path
          // ./node_modules/package-name/package.json => package-name
          .split('/')
          .slice(2, -1)
          .join('/') === peerDependencyName
    );

    for (const mapping of peerDependencyMap[peerDependencyName]) {
      if (packagePathIdx === -1) {
        missingDependencies.push('Missing dependency!');
        missingDependencies.push(`  - Requested: ${peerDependencyName}@${mapping.version.replace(' ', '')}`);
        missingDependencies.push(`  - Required by: ${mapping.path}`);
      } else {
        const packageJson = getPackageJson(resolvePath(packageJsonPaths[packagePathIdx]));

        if (!satisfies(packageJson.version, mapping.version, { loose: true })) {
          const requestedRange = validRange(mapping.version, { loose: true });

          unmetDependencies.push('Unmet dependency!');
          unmetDependencies.push(`  - Requested: ${peerDependencyName}@${requestedRange}`);
          unmetDependencies.push(`  - Installed: ${peerDependencyName}@${packageJson.version}`);
          unmetDependencies.push(`  - Requested by: ${mapping.path}`);
        }

        if (
          !rootPackageJson.hasDependencyDeclared(peerDependencyName) &&
          rootPackageJson.hasDependencyDeclared(mapping.name)
        ) {
          transientDependencies.push('Direct peer dependency is not directly installed!');
          transientDependencies.push(`  - Requested: ${peerDependencyName}@${mapping.version}`);
          transientDependencies.push(`  - Requested by: ${mapping.name}`);
          transientDependencies.push(`  - Installed: ${peerDependencyName}@${packageJson.version}`);
          try {
            transientDependencies.push(
              `  - Installed by: ${dependencyMap[peerDependencyName].map(dep => dep.name).join(', ')}`
            );
          } catch (e) {

            console.error('####################################################################################');
            console.error(` ${peerDependencyName} has likely been removed but still exists in your node_modules`);
            console.error('####################################################################################\n');
          }
        }
      }
    }
  }

  let throwError = 0;

  if (unmetDependencies.length > 0 && LOG_UNMET) {
    console.warn(unmetDependencies.join('\n'));
    throwError += Errors.UNMET;
  }

  if (transientDependencies.length > 0 && LOG_TRANSIENT) {
    console.warn(transientDependencies.join('\n'));
    throwError += Errors.TRANSIENT;
  }

  if (missingDependencies.length > 0 && LOG_MISSING) {
    console.warn(missingDependencies.join('\n'));
    throwError += Errors.MISSING;
  }

  process.exit(throwError);
};

export { validatePeerDependencies };
