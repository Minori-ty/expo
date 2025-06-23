// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config')
const expoConfig = require('eslint-config-expo/flat')

module.exports = defineConfig([
    expoConfig,
    {
        ignores: ['dist/*'],
        parserOptions: {
            ecmaVersion: 'latest', // 或具体版本号如 2022
            sourceType: 'module', // 启用 ES 模块
        },
    },
])
