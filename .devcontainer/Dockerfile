FROM node:20-ubuntu

# 设置环境变量
ENV ANDROID_HOME=/opt/android-sdk
ENV PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools

# 更新包索引并安装系统依赖
RUN apt-get update && \
    apt-get install -y openjdk-17-jdk wget unzip git bash && \
    rm -rf /var/lib/apt/lists/*

# 安装 Android SDK
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
