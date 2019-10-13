import { stat } from 'fs';
import { promisify } from 'util';

const statAsync = promisify(stat);

const isDirectory = async (path: string): Promise<boolean> => {
  return (await statAsync(path)).isDirectory();
};

export { isDirectory };
