import { getAllFiles, parseModules } from './utils';

type ListRuntimeDependenciesOptions = Partial<{
  extension: string[];
  includeExtension: string[];
  ignoreDir: string[];
  ignoreModulePrefix: string[];
  modulePrefix: string[];
  withBuild: boolean;
  withBuiltIn: boolean;
}>;

export const DEFAULT_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];
export const DEFAULT_IGNORE_DIRS = ['.git', 'node_modules', 'build'];
export const DEFAULT_IGNORE_MODULE_PREFIX = ['.', '@/', '/', 'src', '@types'];

const listRuntimeDependencies = async (folders: string[], options: ListRuntimeDependenciesOptions = {}) => {
  const {
    extension: extensionOverride = [],
    includeExtension = [],
    ignoreDir = [],
    ignoreModulePrefix: additionalIgnoreModulePrefix = [],
    modulePrefix: modulePrefixOverride = [],
    withBuild = false,
    withBuiltIn = false,
  } = options;

  const ignoreModulePrefix =
    modulePrefixOverride.length > 0
      ? modulePrefixOverride
      : DEFAULT_IGNORE_MODULE_PREFIX.concat(additionalIgnoreModulePrefix);

  const allFiles = await getAllFiles(folders, {
    extensions: extensionOverride.length > 0 ? extensionOverride : DEFAULT_EXTENSIONS.concat(includeExtension),
    // remove build if from ignored directories if withBuild set
    ignoreDirs: DEFAULT_IGNORE_DIRS.filter(dir => (!withBuild && dir === 'build' ? '' : dir)).concat(ignoreDir),
  });

  const moduleNames: string[] = [];

  for (const file of allFiles) {
    moduleNames.push(...(await parseModules(file, { ignoreModulePrefix, withBuiltIn })));
  }

  return [...new Set(moduleNames)].sort();
};

export { listRuntimeDependencies };
