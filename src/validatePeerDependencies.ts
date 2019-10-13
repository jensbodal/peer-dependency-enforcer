import { existsSync, readdirSync } from 'fs';
import { resolve as resolvePath } from 'path';
import { satisfies, validRange } from 'semver';

const setupErrorHandler = (throwUnmet: boolean, throwMissing: boolean) => {
  process.on('exit', code => {
    switch (code) {
      case 1:
        if (throwUnmet) {
          throw Error('Unmet peer dependencies!');
        }
        break;
      case 2:
        if (throwMissing) {
          throw Error('Missing peer dependencies!');
        }
        break;
      case 3:
        if (throwMissing || throwUnmet) {
          throw Error('Missing and Unmet peer dependencies!');
        }
        break;
    }

    process.exit(0);
  });
};

const validatePeerDependencies = async (
  LOG_MISSING: boolean,
  LOG_UNMET: boolean,
  THROW_MISSING: boolean,
  THROW_UNMET: boolean
) => {
  setupErrorHandler(THROW_UNMET, THROW_MISSING);
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

  const createPeerDependencyMap = async (packageJsonPaths: string[]) => {
    const peerDependencyMap: {
      [peerDependencyName: string]: Array<{
        path: string;
        version: string;
      }>;
    } = {};

    for (const path of packageJsonPaths) {
      const packageJson = require(resolvePath(path));

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
          path,
          version: packageJson.peerDependencies[peerDependency]
        });
      }
    }

    return peerDependencyMap;
  };

  const packageJsonPaths = await findPackageJsonPaths(`${APP_DIR}/node_modules`);
  const peerDependencyMap = await createPeerDependencyMap(packageJsonPaths);
  const missingDependencies: string[] = [];
  const unmetDependencies: string[] = [];

  for (const peerDependencyName of Object.keys(peerDependencyMap)) {
    const packagePathIdx = packageJsonPaths.findIndex(
      path =>
        path
          .split('/')
          .slice(2, -1)
          .join('/') === peerDependencyName
    );

    for (const mapping of peerDependencyMap[peerDependencyName]) {
      if (packagePathIdx === -1) {
        missingDependencies.push(
          `Missing "${peerDependencyName}@${mapping.version.replace(' ', '')}" required by: ${mapping.path}`
        );
      } else {
        const packageJson = require(resolvePath(packageJsonPaths[packagePathIdx]));

        if (!satisfies(packageJson.version, mapping.version, { loose: true })) {
          const requestedRange = validRange(mapping.version, { loose: true });

          unmetDependencies.push('Unmet dependency!');
          unmetDependencies.push(`  - Requested: ${peerDependencyName}@${requestedRange}`);
          unmetDependencies.push(`  - Installed: ${peerDependencyName}@${packageJson.version}`);
          unmetDependencies.push(`  - Requested by: ${mapping.path}`);
        }
      }
    }
  }

  let throwError = 0;

  if (unmetDependencies.length > 0 && LOG_UNMET) {
    console.warn(unmetDependencies.join('\n'));
    throwError += 1;
  }

  if (missingDependencies.length > 0 && LOG_MISSING) {
    console.warn(missingDependencies.join('\n'));
    throwError += 2;
  }

  process.exit(throwError);
};

export { validatePeerDependencies };
