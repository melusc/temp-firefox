$root = "$PSScriptRoot/.."

Push-Location $root
yarn start @args
Pop-Location
