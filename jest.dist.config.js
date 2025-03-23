module.exports = {
    testEnvironment: 'node',
    verbose: true,
    roots: ['<rootDir>/dist/tests'],   // 👈 מחפש את הטסטים רק בתוך dist
    testMatch: ['**/*.test.js'],       // 👈 רק קבצי טסט JS
    moduleFileExtensions: ['js', 'json']
  };
  