/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
export default {
    preset: "ts-jest",
    testEnvironment: "node",
    verbose: true, 
    collectCoverage: true,
    coverageDirectory: "coverage",
    coverageReporters: ["text", "lcov"],

    roots: ["<rootDir>/tests/"], 
    testMatch: ["**/*.test.ts"], 
};
