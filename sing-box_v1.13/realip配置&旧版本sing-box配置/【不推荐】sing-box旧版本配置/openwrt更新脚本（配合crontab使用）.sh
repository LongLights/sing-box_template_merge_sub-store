#!/bin/sh

echo "[$(date)] 开始更新 config.json" >> /etc/singbox/update.log
curl -s -o /etc/singbox/config.json <http://你在sub-store中的模板链接>

if [ $? -eq 0 ]; then
  echo "[$(date)] 下载成功，重启 sing-box" >> /etc/singbox/update.log
  /etc/init.d/sing-box stop >/dev/null 2>&1
  /etc/init.d/sing-box start
else
  echo "[$(date)] ❌ 下载失败，请检查网络或链接" >> /etc/singbox/update.log
fi

