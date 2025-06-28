// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config')
const expoConfig = require('eslint-config-expo/flat')

module.exports = defineConfig([
    expoConfig,
    {
        ignores: ['dist/*'],
        languageOptions: {
            parserOptions: {
                ecmaVersion: 'latest', // 或具体版本号如 2022
                sourceType: 'module', // 启用 ES 模块
            },
        },
    },
    {
        files: ['**/*.{js,jsx,ts,tsx}'], // 明确要检查的文件类型
        // 插件配置
        plugins: {
            'react-native': require('eslint-plugin-react-native'),
        },

        // 规则配置
        rules: {
            // 核心规则：禁止裸文本，必须包裹在<Text>中
            'react-native/no-raw-text': 'error',

            // 其他React Native推荐规则（可选）
            'react-native/no-unused-styles': 'warn', // 检测未使用的样式
            'react-native/no-inline-styles': 'warn', // 不推荐内联样式
            'react-native/split-platform-components': 'error', // 规范平台特定组件
        },

        // 设置React版本（帮助eslint-plugin-react正确工作）
        settings: {
            react: {
                version: 'detect', // 自动检测React版本
            },
        },
    },
])
