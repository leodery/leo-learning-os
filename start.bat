@echo off
chcp 65001 >nul
title Leo Learning OS

rem 这台电脑没有全局安装 Node，用的是项目旁边的免安装版
set "NODE_DIR=%~dp0..\.tools\node-v24.21.0-win-x64"
set "PATH=%NODE_DIR%;%PATH%"
cd /d "%~dp0"

if not exist "%NODE_DIR%\npm.cmd" (
  echo [错误] 找不到 Node：%NODE_DIR%
  echo 请确认 .tools 目录还在。
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo 第一次启动，正在安装依赖……
  call "%NODE_DIR%\npm.cmd" install --no-audit --no-fund
)

echo.
echo 正在启动 Leo Learning OS，稍等几秒浏览器会自动打开。
echo 关闭这个黑窗口就等于停止服务。
echo.

start "" http://localhost:3000
call "%NODE_DIR%\npm.cmd" run dev

pause