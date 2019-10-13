import { getAllFiles, parseModules } from './utils';

const listRuntimeDependencies = async (folders: string[]) => {
  const ignorePrefix = ['.', 'src/'];

  const allFiles = await getAllFiles(folders, {
    excludeDirs: ['.git', 'node_modules', 'build'],
    extensions: ['.ts', '.tsx', '.js', '.jsx']
  });

  const moduleNames: string[] = [];

  for (const file of allFiles) {
    moduleNames.push(...(await parseModules(file, ignorePrefix)));
  }

  console.log('Your non-1st-party runtime dependencies');
  console.log([...new Set(moduleNames.sort())]);
};

export { listRuntimeDependencies };
