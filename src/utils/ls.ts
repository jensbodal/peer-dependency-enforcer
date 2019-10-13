import { readdir } from 'fs';
import { resolve as resolvePath } from 'path';
import { promisify } from 'util';

import { isDirectory } from './isDirectory';

const readdirAsync = promisify(readdir);

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

export { ls };
