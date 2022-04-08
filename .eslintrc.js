module.exports = {
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    //'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [/*'react', */ '@typescript-eslint'],
  rules: {
    'no-unused-vars': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    //'react/jsx-uses-react': 'off',
    //'react/react-in-jsx-scope': 'off',
    //'react/prop-types': 'off',
  },
};
