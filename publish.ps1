Remove-Item -Recurse Publish
& dotnet publish .\Soundboard.Server.csproj --configuration Release --output .\Publish --self-contained --runtime win-x64
cd Website
& ng build --configuration=production
cd ..
NeW-Item -ItemType Directory .\publish\Website
Copy-Item -Recurse .\Website\dist\soundboard\* .\publish\Website
