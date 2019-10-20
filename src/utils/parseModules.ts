import { readFile } from 'fs';
import module from 'module';
import { promisify } from 'util';

import { logger } from '@/utils';

const readFileAsync = promisify(readFile);

const isScopedModule = (moduleName: string) => /^@[^\/]/.test(moduleName);

interface ParseModulesOptions {
  ignoreModulePrefix: string[];
  withBuiltIn: boolean;
}
type ParseModules = (filePath: string, options?: Partial<ParseModulesOptions>) => Promise<string[]>;

const defaultOptions = {
  ignoreModulePrefix: [],
  withBuiltIn: false,
};

const parseModules: ParseModules = async (filePath: string, passedOptions = {}) => {
  // override any default options that have been given
  const options = {
    ...defaultOptions,
    ...passedOptions,
  };

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
  let recursionSafety = 10000;

  while (true) {
    recursionSafety--;

    if (--recursionSafety === 0) {
      throw Error('Recursion safety limit hit 10,000 iterations, likely something unknown went wrong');
    }

    const matches = fileContentsRemainder.match(moduleBlockRegex);

    if (!(matches && matches.length === 3)) {
      break;
    }

    const importStatement = matches[1];
    // strip quotes that we added when putting file into one line
    const importName = matches[2].replace(/"/g, '');
    const importNameParts = importName.split('/');

    // TODO this function name doesn't make sense
    const moduleName: string = isScopedModule(importNameParts[0])
      ? // scoped modules have a package name like @scope/packageName, so join the first two elements
        importNameParts.slice(0, 2).join('/')
      : // since scoped modules begin with '@' and relative directories begin with '.'
      // we will just return the original import name since they should be 1st party dependencies
      ['@', '.'].some(v => v === importNameParts[0])
      ? importName
      : // if a non-1st-party dependency isn't scoped, the module name will just be the first part
        importNameParts[0];

    fileContentsRemainder = fileContentsRemainder.replace(importStatement, '');

    const builtInModules = options.withBuiltIn ? [] : module.builtinModules;

    if (
      !options.ignoreModulePrefix.some(prefix => importName.startsWith(`${prefix}`)) &&
      !builtInModules.includes(moduleName)
    ) {
      // moduleCache is currently only on a per file basis
      // to support cache for entire runtime requires rethinking unit tests
      // check if jest supports reimporting modules between tests?
      if (!moduleCache.has(moduleName)) {
        logger.verbose(moduleName);
        logger.verbose(filePath);

        moduleCache.add(moduleName);
        moduleNames.push(moduleName);
      }
    }
  }

  return moduleNames;
};

export { parseModules };
