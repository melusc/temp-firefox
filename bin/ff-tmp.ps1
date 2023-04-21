$id = Get-Date -UFormat '+%Y-%m-%dT%H-%M-%SZ'
$root = Resolve-Path "$PSScriptRoot/.."
mkdir "$root/out" -Force
Start-Process node `
	"$root/dist/detached.js" `
	-RedirectStandardOutput "$root/out/out-$id.txt" `
	-RedirectStandardError "$root/out/out-$id.error" `
	-NoNewWindow
