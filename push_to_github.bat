@echo off
cd /d "C:\Users\vaitl\Desktop\csmcmrtc"
set "PATH=C:\Users\vaitl\AppData\Local\Programs\MinGit\cmd;C:\Users\vaitl\AppData\Local\Programs\MinGit\mingw64\bin;%PATH%"

echo ===================================================
echo Pushing latest changes to GitHub (csmcmrtc/csmcmrtc)
echo ===================================================
git add .
git commit -m "Update project files"
git push origin main

echo.
echo ===================================================
echo Done!
echo ===================================================
pause
