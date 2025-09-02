module.exports = {
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 120,
  tabWidth: 2,
  useTabs: false,
  bracketSpacing: true,
  arrowParens: 'avoid',
  endOfLine: 'lf',
  bracketSameLine: false,
  quoteProps: 'as-needed',
  jsxSingleQuote: false,
  jsxBracketSameLine: false,
  embeddedLanguageFormatting: 'auto',
  singleAttributePerLine: false,
  overrides: [
    {
      files: '*.{json,yml,yaml}',
      options: {
        parser: 'json',
      },
    },
    {
      files: '*.md',
      options: {
        parser: 'markdown',
        tabWidth: 2,
        printWidth: 80,
        proseWrap: 'always',
      },
    },
    {
      files: '*.{html,css,scss,less}',
      options: {
        parser: 'css',
      },
    },
    {
      files: '*.{ts,tsx}',
      options: {
        parser: 'typescript',
      },
    },
    {
      files: '*.{js,jsx}',
      options: {
        parser: 'babel',
      },
    },
  ],
};