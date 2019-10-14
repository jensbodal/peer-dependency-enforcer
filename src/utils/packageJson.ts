import { join } from 'path';

import { getRootPath } from '@/utils/paths';

interface ModuleEntry {
  [moduleName: string]: string;
}
interface PackageJsonFile {
  readonly name: string;
  readonly version: string;
  readonly dependencies: Readonly<ModuleEntry>;
  readonly devDependencies: Readonly<ModuleEntry>;
  readonly peerDependencies: Readonly<ModuleEntry>;
  readonly peerDependenciesMeta: Readonly<{
    [moduleName: string]: {
      optional?: boolean;
    };
  }>;
}

class PackageJson implements PackageJsonFile {
  public dependencies: PackageJsonFile['dependencies'];
  public devDependencies: PackageJsonFile['devDependencies'];
  public peerDependencies: PackageJsonFile['peerDependencies'];
  public peerDependenciesMeta: PackageJsonFile['peerDependenciesMeta'];
  public name: PackageJsonFile['name'];
  public version: PackageJsonFile['version'];

  constructor(private readonly packageJsonPath?: string) {
    if (!this.packageJsonPath) {
      this.packageJsonPath = join(getRootPath(), 'package.json');
    }

    ({
      dependencies: this.dependencies = {},
      devDependencies: this.devDependencies = {},
      name: this.name,
      peerDependencies: this.peerDependencies = {},
      peerDependenciesMeta: this.peerDependenciesMeta = {},
      version: this.version,
    } = require(this.packageJsonPath) as PackageJsonFile);
  }

  public hasDependencyDeclared(depName: string) {
    return this.getAllDeclaredDependencies().hasOwnProperty(depName);
  }

  public getAllDeclaredDependencies() {
    return {
      ...this.dependencies,
      ...this.devDependencies,
    };
  }
}

const getPackageJson = (packageJsonPath?: string) => {
  return new PackageJson(packageJsonPath);
};

export { getPackageJson };
