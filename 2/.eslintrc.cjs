// .eslintrc.js

module.exports = {
    "parser": "@typescript-eslint/parser",
    "plugins": ["@typescript-eslint"],
    "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended"
    ],
    "env": {
        "node": true,
        "jest": true
    },
    "rules": {
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/no-explicit-any": "warn",
        "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }]
    },
    "overrides": [
        {
            "files": ["**/*.d.ts"],
            "rules": {
                "no-var": "off"
            }
        }
    ]
};