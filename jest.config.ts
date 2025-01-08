/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
export default {
    preset: "ts-jest",
    testEnvironment: "node",
    verbose: true, // מציג יותר מידע על הבדיקות (עודכן)
    collectCoverage: true,
    coverageDirectory: "coverage",
    coverageReporters: ["text", "lcov"],

    roots: ["<rootDir>/tests/"], // מצביע על תיקיית הבדיקות
    testMatch: ["**/*.test.ts"], // תואם לקבצים עם `.test.ts` מכל מקום
};
