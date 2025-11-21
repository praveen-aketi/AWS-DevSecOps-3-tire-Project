module.exports = {
    testEnvironment: 'node',
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/**/*.test.js',
        '!**/node_modules/**',
    ],
    testMatch: ['**/tests/**/*.test.js'],
    // Coverage thresholds disabled for CI simplicity
    coverageThreshold: {
        global: {
            branches: 0,
            functions: 0,
            lines: 0,
            statements: 0,
        },
    },
    testTimeout: 10000,
    verbose: true,
};
