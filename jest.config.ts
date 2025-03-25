import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    verbose: true,
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov'],
    roots: ['<rootDir>/tests'],
    testMatch: ['**/*.test.ts'],
    moduleFileExtensions: ['ts', 'js'],
    coveragePathIgnorePatterns: [
        "/node_modules/",
        "src/docs/geminiService.ts",
        "src/docs/recipeApi.ts",
        "src/controllers/generateNutritionController.ts",
        "src/controllers/recipeController.ts",
        "src/server.ts"
      ]
};

export default config;