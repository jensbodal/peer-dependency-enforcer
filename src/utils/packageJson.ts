import { join } from 'path';

import { getRootPath } from '@/utils/paths';

interface PackageJson {
  version: string;
  dependencies?: {
    [moduleName: string]: string;
  };
  devDependencies?: {
    [moduleName: string]: string;
  };
  peerDependencies?: {
    [moduleName: string]: string;
  };
}
const packageJson = () => {
  const pkg: PackageJson = require(join(getRootPath(), 'package.json'));
  return pkg;
};

export { packageJson };
