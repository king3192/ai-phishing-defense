@echo off
cd /d "%~dp0backend"
set PATH=C:\Users\Prana\AppData\Local\Programs\Python\Python311;C:\Users\Prana\AppData\Local\Programs\Python\Python311\Scripts;%PATH%
call venv\Scripts\activate.bat
python main.py
pause
