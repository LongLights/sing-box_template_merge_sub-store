@echo off
echo [%date% %time%] ��ʼ���� config.json...

:: ������������
curl -o D:\singbox\config.json <http://����sub-store�е�ģ������>

if %ERRORLEVEL% NEQ 0 (
  echo [%date% %time%] ����ʧ�ܣ�
  exit /b 1
)

echo [%date% %time%] ���سɹ������� sing-box...

:: �ر����н��̣�������ڣ�
taskkill /f /im sing-box.exe >nul 2>&1

:: �����µ� sing-box ��̨���У�ʹ�� start ��С����
start "" /min D:\singbox\sing-box.exe run -c D:\singbox\config.json -D D:\singbox

echo [%date% %time%] ������ sing-box��
