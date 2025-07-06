FROM node:alpine

# 安装系统依赖
RUN apk update && \
    apk add --no-cache openjdk17-jdk wget unzip git && \
    rm -rf /var/cache/apk/*

# 安装 Android SDK
ENV ANDROID_HOME=/opt/android-sdk
ENV PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools

RUN mkdir -p $ANDROID_HOME/cmdline-tools && \
    wget -q https://dl.google.com/android/repository/commandlinetools-linux-10406996_latest.zip -O cmdline-tools.zip && \
    unzip -q cmdline-tools.zip -d /tmp && \
    mkdir -p $ANDROID_HOME/cmdline-tools/latest && \
    mv /tmp/cmdline-tools/* $ANDROID_HOME/cmdline-tools/latest/ && \
    rm cmdline-tools.zip

# 接受 Android SDK 许可证
RUN yes | $ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager --licenses

# 安装 Android 平台和构建工具
RUN $ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager "platforms;android-35" \
    "build-tools;35.0.0" \
    "ndk;27.1.12297006" \
    "cmdline-tools;latest"

# 安装 npm 全局依赖
RUN npm install -g eas-cli expo expo-doctor expo-cli typescript

WORKDIR /workspaces/expo
RUN bash && npm i && npm run build
# 复制 package.json 和 package-lock.json
# COPY package*.json ./

# 安装项目依赖
# RUN npm install

# 复制项目文件
# COPY . .

# 构建应用
# RUN npm run build

# 获取版本号并重命名 APK 文件
# RUN VERSION=$(npm pkg get version | tr -d '\"') && \
#     APK_FILE=$(ls *.apk | head -n 1) && \
#     mv "$APK_FILE" "v$VERSION.apk" && \
#     echo "APK_VERSION=$VERSION" > .env