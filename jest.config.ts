/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
export default {
    preset: "ts-jest",
    testEnvironment: "node",
    roots: ["<rootDir>/tests/"], // מצביע על תיקיית הבדיקות
    testMatch: ["**/*.test.ts"], // תואם לקבצים עם `.test.ts` מכל מקום
};
