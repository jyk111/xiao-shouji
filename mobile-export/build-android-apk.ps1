$ErrorActionPreference = "Stop"

Push-Location (Split-Path -Parent $MyInvocation.MyCommand.Path)
.\refresh-web.ps1
npx eas-cli build -p android --profile preview
Pop-Location
