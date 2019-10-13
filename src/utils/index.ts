import { exists, readdir, readFile, stat } from 'fs';
import { resolve as resolvePath } from 'path';
import { promisify } from 'util';

const existsAsync = promisify(exists);
const readdirAsync = promisify(readdir);
const readFileAsync = promisify(readFile);
const statAsync = promisify(stat);

/**
 * Returns true if any value in needle array is in haystack array
 * @param hayStackArray array to search
 * @param needleArray array of values to look for
 */
const arrayContains = (hayStackArray: any[], needleArray: any[]) => {
  return hayStackArray.filter(v => needleArray.includes(v)).length > 0;
};

const isDirectory = async (path: string): Promise<boolean> => {
  return (await statAsync(path)).isDirectory();
};

/**
 * Obtain an arry of the absolute file path for all matching files in an array
 * of absolute folder paths
 * @param folders array of absolute folder paths
 * @param options object
 */
const getAllFiles = async (
  folders: string[],
  options?: {
    recursive?: boolean;
    excludeDirs?: string[];
    extensions?: string[];
  }
) => {
  const allFiles: string[] = [];

  for (const folder of folders) {
    if (!(await existsAsync(folder))) {
      throw Error(`${folder} does not exist`);
    }

    const folderPath = resolvePath(folder);

    allFiles.push(...(await ls(folderPath, { ...options, recursive: true })));
  }

  return allFiles;
};

/**
 * Wrapper around readdirSync which allows async listing of files with
 * folder exclusions, extension inclusions, and recurse abilities
 * @param path absolute file path to list from
 * @param options object
 */
const ls = async (
  path: string,
  options?: {
    recursive?: boolean;
    excludeDirs?: string[];
    extensions?: string[];
  }
) => lsHelper([], path, options);

const lsHelper = async (
  allFiles: string[],
  path: string,
  options?: {
    recursive?: boolean;
    excludeDirs?: string[];
    extensions?: string[];
  }
) => {
  const rootPath = resolvePath(path);
  let files: string[];
  const excludeDirs = (options && options.excludeDirs) || [];
  const recursive = (options && options.recursive) || false;
  const extensions = (options && options.extensions) || [];

  try {
    files = await readdirAsync(rootPath);
  } catch (e) {
    files = [rootPath];
  }

  for (const fileName of files) {
    let filePath = `${rootPath}/${fileName}`;

    try {
      if (await isDirectory(filePath)) {
        // if recursing and folder name is not excluded then recurse
        if (recursive === true && !excludeDirs.some(dir => dir === fileName)) {
          await lsHelper(allFiles, filePath, options);
        }
        continue;
      }
    } catch (e) {
      // if filePath is not a directory our rootPath is a file
      filePath = rootPath;
    }

    // if extensions given then discard all files that aren't of those extension types
    if (extensions.length > 0 && !extensions.some(v => filePath.endsWith(v))) {
      continue;
    }

    allFiles.push(filePath);
  }

  return allFiles;
};

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

export { arrayContains, getAllFiles, ls, parseModules };
