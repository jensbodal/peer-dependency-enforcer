import { exists } from 'fs';
import { resolve as resolvePath } from 'path';
import { promisify } from 'util';

import { ls } from './ls';

const existsAsync = promisify(exists);

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

export { getAllFiles };
