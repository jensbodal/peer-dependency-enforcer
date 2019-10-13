import { readFile } from 'fs';
import { promisify } from 'util';

const readFileAsync = promisify(readFile);

/**
 * Searches a file for any import or requires statement and returns all modules
 * imported using either mod
 * @param filePath aboluste path to the file
 */
const parseModules = async (filePath: string, ignorePrefix: string[]) => {
  const blob = await readFileAsync(filePath);
  const fileContents = blob.toString();
  // put all contents on one line with no spaces and exclusively double quotes
  const fileContentsOneLine = fileContents.replace(/\r?\n|\r|[ ]+/g, '').replace(/'/g, '"');

  /**
   * /
   * .*?                          # non-greedy match anything
   * (                            # start of first capture group (importStatement)
   * (?:import.*?from|require\()  # non-capturing group for text "import from" or "require("
   *                              # ^ (with zero or more characters between import and from)
   *                              # ^ "require(" will always match a require because spaces have been stripped
   * .*?                          # non-greedy match anything
   * (".*?")                      # capture first block of text in quotes using non-greedy match
   *                              # ^ the second capturing group (moduleName)
   * [;\)]?                       # capturing group ends with either a semi-colon or ")"
   * )                            # end of first capture group (importStatement)
   * /;
   */
  const moduleBlock = /.*?((?:import.*?from|require\().*?(".*?")[;\)]?)/;
  const modules: string[] = [];
  let fileContentsRemainder = fileContentsOneLine;

  while (true) {
    const matches = fileContentsRemainder.match(moduleBlock);
    if (matches && matches.length === 3) {
      const importStatement = matches[1];
      const moduleName = matches[2];

      fileContentsRemainder = fileContentsRemainder.replace(importStatement, '');

      if (!ignorePrefix.some(prefix => moduleName.startsWith(`"${prefix}`))) {
        // strip quotes
        modules.push(moduleName.replace(/"/g, ''));
      }
    } else {
      break;
    }
  }

  return modules;
};

export { parseModules };
