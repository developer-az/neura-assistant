module.exports = {
  extends: [
    'expo',
    '@react-native',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    // Allow console.log for debugging
    'no-console': 'warn',
    // Allow unused variables starting with _
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    // Allow any type temporarily during development
    '@typescript-eslint/no-explicit-any': 'warn',
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    '*.config.js',
    '*.config.ts',
  ],
};