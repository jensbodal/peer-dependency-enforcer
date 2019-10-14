import { getAllFiles, logger, parseModules } from './utils';

const listRuntimeDependencies = async (folders: string[]) => {
  const ignorePrefix = ['.', '@/', '/', 'src'];

  const allFiles = await getAllFiles(folders, {
    excludeDirs: ['.git', 'node_modules', 'build'],
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  });

  const moduleNames: string[] = [];

  if (process.env.babelParser) {
    logger.debug('parsing via babel');
  } else {
    logger.debug('parsing using regex');
  }

  for (const file of allFiles) {
    moduleNames.push(...(await parseModules(file, { ignorePrefix })));
  }

  const distinctModuleNames = [...new Set(moduleNames)].sort();

  console.log('Your non-1st-party runtime dependencies');
  console.log(distinctModuleNames);
};

export { listRuntimeDependencies };
