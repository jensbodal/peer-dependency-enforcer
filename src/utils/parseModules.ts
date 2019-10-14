import { readFile } from 'fs';
import { promisify } from 'util';

import { logger } from '@/utils';

const readFileAsync = promisify(readFile);

const isScopedModule = (moduleName: string) => /^@[^\/]/.test(moduleName);

const parseScopedModule = (moduleName: string) => {
  const [, scopedImport] = moduleName.split('@');
  const [scopeName, packageName] = scopedImport.split('/');
  return `@${scopeName}/${packageName}`;
};

interface ParseModulesOptions {
  ignorePrefix: string[];
}
type ParseModules = (filePath: string, options?: Partial<ParseModulesOptions>) => Promise<string[]>;

const defaultOptions = {
  ignorePrefix: [],
};

const parseModules: ParseModules = async (filePath: string, passedOptions = {}) => {
  // override any default options that have been given
  const options = {
    ...defaultOptions,
    ...passedOptions,
  };

  logger.debug(filePath);

  const blob = await readFileAsync(filePath);
  const fileContents = blob.toString();

  /**
   * /
   * (                            # start of first capture group (importStatement)
   * (?:import[ ]+.+?from\s+?)    # non-capturing group for text "import from "
   *                              # ^ (with at least one whitespace after import)
   *                              # ^ (with any number of characters after whitespace between import and from)
   *                              # ^ (with at least one whitespace character after from until next match group)
   * |                            # or between non-capturing groups
   * (?:require\s*?\(\s*?)        # non-capturing group for text "require ( "
   *                              # ^ (with zero or more whitespace between require and open parenthesis)
   *                              # ^ (with zero or more whitespace after open parenthesis until next match group)
   * )                            # end of first capture group
   * ("\S+?")                     # start of second capture group
   *                              # ^ capture any non-whitespace characters between quotes
   * [;\)]?                       # 2nd capture group followed by a semi-colon or closing parenthesis
   */
  const moduleBlockRegex = /((?:import[ ]+.+?from\s+?)|(?:require\s*?\(\s*?))("\S+?")[;\)]?/;

  // put all contents on one line and exclusively double quotes
  const fileContentsOneLine = fileContents.replace(/\r?\n|\r/g, '').replace(/'/g, '"');

  const moduleCache = new Set<string>();
  const moduleNames: string[] = [];
  let fileContentsRemainder = fileContentsOneLine;
  let recursionSafety = 100;

  while (true) {
    recursionSafety--;

    if (--recursionSafety === 0) {
      break;
    }

    const matches = fileContentsRemainder.match(moduleBlockRegex);

    if (!(matches && matches.length === 3)) {
      break;
    }

    const importStatement = matches[1];
    // strip quotes that we added when putting file into one line
    const importName = matches[2].replace(/"/g, '');

    const moduleName: string = isScopedModule(importName) ? parseScopedModule(importName) : importName;

    fileContentsRemainder = fileContentsRemainder.replace(importStatement, '');

    if (!options.ignorePrefix.some(prefix => moduleName.startsWith(`${prefix}`))) {
      if (!moduleCache.has(moduleName)) {
        moduleCache.add(moduleName);
        moduleNames.push(moduleName);
      }
    }
  }

  return moduleNames;
};

export { parseModules };
