@echo off
echo [%date% %time%] 开始更新 config.json...

:: 下载最新配置
curl -o D:\sing-box\config.json <http://你在sub-store中的模板链接>

if %ERRORLEVEL% NEQ 0 (
  echo [%date% %time%] 下载失败！
  exit /b 1
)

echo [%date% %time%] 下载成功，重启 sing-box...

:: 关闭已有进程（如果存在）
taskkill /f /im sing-box.exe >nul 2>&1

:: 启动新的 sing-box 后台运行（使用 start 最小化）
start "" /min D:\sing-box\sing-box.exe run -c D:\sing-box\config.json -D D:\sing-box

echo [%date% %time%] 已重启 sing-box。
