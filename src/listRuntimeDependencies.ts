import { getAllFiles, parseModules } from './utils';

const listRuntimeDependencies = async (folders: string[]) => {
  const ignorePrefix = ['.', '@/', '/', 'src'];

  const allFiles = await getAllFiles(folders, {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    ignoreDirs: ['.git', 'node_modules', 'build', 'test/files'],
  });

  const moduleNames: string[] = [];

  for (const file of allFiles) {
    moduleNames.push(...(await parseModules(file, { ignorePrefix })));
  }

  return [...new Set(moduleNames)].sort();
};

export { listRuntimeDependencies };
