@echo off
cd /d %~dp0

echo ========== 初始化 Git ==========
git init
git branch -M main

echo ========== 输入 GitHub 仓库地址 ==========
set /p repo=请输入 GitHub 仓库地址（例如：https://github.com/你的用户名/仓库名.git）： 
git remote add origin %repo%

echo ========== 写入 .gitignore ==========
(
    echo /node_modules
    echo /.next
    echo /out
    echo .DS_Store
    echo npm-debug.log*
    echo yarn-debug.log*
    echo yarn-error.log*
    echo .env.local
    echo .env.development.local
    echo .env.test.local
    echo .env.production.local
) > .gitignore

echo ========== 添加文件 ==========
git add .

echo ========== 提交 ==========
git commit -m "Initial commit"

echo ========== 推送到 GitHub ==========
git push -u origin main

echo ✅ 上传完成
pause