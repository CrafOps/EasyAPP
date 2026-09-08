@echo off
for /f "delims=" %%i in ('node -e "console.log(require('./package.json').version)"') do set VERSION=%%i

echo Current version: %VERSION%
set /p NEW_VERSION="New version: "

node -e "const fs=require('fs');const p=JSON.parse(fs.readFileSync('package.json'));p.version='%NEW_VERSION%';fs.writeFileSync('package.json',JSON.stringify(p,null,2))"

git add package.json
git commit -m "release: v%NEW_VERSION%"
git tag v%NEW_VERSION%
git push origin main
git push origin v%NEW_VERSION%

echo Done! Released v%NEW_VERSION%