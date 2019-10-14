import { existsSync } from 'fs';
import { join } from 'path';

/**
 * Obtains the root path of the repository this module is installed in
 * e.g. my-package/node_modules/this-package => my-package
 */
const getRootPath = (startPath = process.cwd()): string => {
  const currentPath = startPath;

  if (existsSync(`${currentPath}/package.json`)) {
    return currentPath;
  }

  if (currentPath === '/') {
    throw Error('Could not find a package.json');
  }

  return getRootPath(join(currentPath, '..'));
};

/**
 * Obtains the installed path this module is installed at
 * e.g. my-package/node_modules/this-package/foo => my-package/node_modules/this-package
 */
const getInstalledPath = () => {
  return join(__dirname, '../..');
};

export { getInstalledPath, getRootPath };
