// const baseConfig = require(...);
const baseConfig = { singleQuote: true };

module.exports = {
  ...baseConfig,
  endOfLine: 'lf',
  overrides: [
    {
      files: '*',
      options: {
        printWidth: 120
      }
    },
    {
      files: '*.json',
      options: {
        parser: 'json'
      }
    },
    {
      files: './**/*.ts',
      options: {
        parser: 'typescript'
      }
    }
  ]
};
