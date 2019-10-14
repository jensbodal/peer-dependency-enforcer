// const baseConfig = require(...);
const baseConfig = { singleQuote: true, trailingComma: 'es5' };

module.exports = {
  ...baseConfig,
  endOfLine: 'lf',
  overrides: [
    {
      files: '*',
      options: {
        printWidth: 120,
      },
    },
    {
      files: '*.json',
      options: {
        parser: 'json',
      },
    },
    {
      files: './**/*.ts',
      options: {
        parser: 'typescript',
      },
    },
  ],
};
