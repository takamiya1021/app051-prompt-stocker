/** @type {import('jest').Config} */
module.exports = {
    testEnvironment: 'jsdom',
    testMatch: ['**/__tests__/**/*.test.js'],
    collectCoverageFrom: ['js/**/*.js'],
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80
        }
    }
};
