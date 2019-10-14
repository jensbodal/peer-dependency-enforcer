import { parseModules } from './parseModules';

const testFiles = `${process.cwd()}/test/files`;

describe('parseModules()', () => {
  describe('parsing our own files', () => {
    it('parses parseModules.ts', async () => {
      const result = await parseModules(`${__dirname}/parseModules.ts`);
      const expectedResult = ['@/utils', 'fs', 'util'];
      expect(result.sort()).toEqual(expectedResult);
    });

    it('parses arrayContains.ts', async () => {
      const result = await parseModules(`${__dirname}/arrayContains.ts`);
      expect(result.sort()).toEqual([]);
    });

    it('parses ls.ts', async () => {
      const result = await parseModules(`${__dirname}/ls.ts`);
      expect(result.sort()).toEqual(['./isDirectory', 'fs', 'path', 'util']);
    });

    it('parses utils/index.ts', async () => {
      const result = await parseModules(`${__dirname}/index.ts`);
      expect(result.sort()).toEqual(['./arrayContains', './getAllFiles', './logger', './ls', './parseModules']);
    });
  });

  describe('parsing test files', () => {
    it('parses parseModules.compiled.js', async () => {
      const result = await parseModules(`${testFiles}/parseModules.compiled.js`);
      const expectedResult = ['@/utils', '@babel/parser', '@babel/types', 'fs', 'util'];
      expect(result.sort()).toEqual(expectedResult);
    });

    it('parses parseModules.compiled.js with excludePrefix "@/"', async () => {
      const result = await parseModules(`${testFiles}/parseModules.compiled.js`, { ignorePrefix: ['@/'] });
      const expectedResult = ['@babel/parser', '@babel/types', 'fs', 'util'];
      expect(result.sort()).toEqual(expectedResult);
    });

    it('requireAndImport.js', async () => {
      const result = await parseModules(`${testFiles}/requireAndImport.js`);
      const expectedResult = [
        '3',
        '4',
        '5',
        '@scope/anotherScopedPackage',
        '@scope/package',
        'default-import-with-semi-colon',
        'defaultImportNoSemiColon',
        'named-import-with-semi-colon',
        'namedImportNoSemiColon',
        'requireNoSemiColon',
        'requireWithSemiColon',
        'requireWithSpaces',
        'requireWithSpaces2',
        'requireWithSpaces3',
      ];
      expect(result.sort()).toEqual(expectedResult);
    });
  });
});
