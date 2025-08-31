@echo off
cd /d %~dp0

echo ========== 添加所有变更 ==========
git add .

echo ========== 输入提交说明（默认 update）==========
set /p msg=提交说明： 
if "%msg%"=="" set msg=update

echo ========== 提交并推送 ==========
git commit -m "%msg%"
git push

echo ✅ 更新已推送到 GitHub！
pause