# Configura GitHub + Pages + primer despliegue automático
# Uso: .\scripts\setup-github.ps1
# Opcional: .\scripts\setup-github.ps1 -Web3FormsKey "tu-clave"

param(
  [string]$RepoName = "guia-montilla",
  [string]$Web3FormsKey = ""
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

function Require-Gh {
  if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    throw "Instala GitHub CLI: winget install GitHub.cli"
  }
  $auth = gh auth status 2>&1
  if ($LASTEXITCODE -ne 0) {
    Write-Host "`nInicia sesión en GitHub (se abrirá el navegador)...`n" -ForegroundColor Yellow
    gh auth login -h github.com -p https -w -s repo,workflow,admin:repo
    if ($LASTEXITCODE -ne 0) { throw "No se pudo autenticar en GitHub." }
  }
}

function Ensure-Commit {
  if (-not (Test-Path ".git")) {
    git init
    git branch -M main
  }
  $status = git status --porcelain
  if ($status) {
    git add .
    git -c user.name="Guía Montilla" -c user.email="bot@guia-montilla.local" `
      commit -m "Guía Montilla — listo para publicar"
  }
}

Write-Host "=== Guía Montilla — setup GitHub ===" -ForegroundColor Cyan
Require-Gh
Ensure-Commit

$owner = (gh api user -q .login)
$remote = git remote get-url origin 2>$null

if (-not $remote) {
  Write-Host "Creando repo $owner/$RepoName ..." -ForegroundColor Green
  gh repo create $RepoName --public --source=. --remote=origin --push
} else {
  Write-Host "Subiendo a origin ..." -ForegroundColor Green
  git push -u origin main
}

Write-Host "Activando GitHub Pages (Actions) ..." -ForegroundColor Green
gh api -X POST "/repos/$owner/$RepoName/pages" -f build_type=workflow 2>$null
if ($LASTEXITCODE -ne 0) {
  gh api -X PUT "/repos/$owner/$RepoName/pages" -f build_type=workflow | Out-Null
}

Write-Host "Permisos de escritura para Actions ..." -ForegroundColor Green
gh api -X PUT "/repos/$owner/$RepoName/actions/permissions" `
  -f enabled=true -f allowed_actions=all | Out-Null
gh api -X PUT "/repos/$owner/$RepoName/actions/permissions/workflow" `
  -f default_workflow_permissions=write `
  -f can_approve_pull_request_reviews=false | Out-Null

gh secret set SITE_URL --body "https://guiamontilla.es" 2>$null

if ($Web3FormsKey) {
  gh secret set PUBLIC_WEB3FORMS_KEY --body $Web3FormsKey
  Write-Host "Secret PUBLIC_WEB3FORMS_KEY guardado." -ForegroundColor Green
} else {
  Write-Host "Aviso: sin PUBLIC_WEB3FORMS_KEY los formularios no enviarán email en producción." -ForegroundColor Yellow
  Write-Host "  Añádelo después: gh secret set PUBLIC_WEB3FORMS_KEY" -ForegroundColor Yellow
}

Write-Host "Lanzando primer despliegue ..." -ForegroundColor Green
gh workflow run "Actualizar y publicar"

Write-Host "`nListo." -ForegroundColor Cyan
Write-Host "  Repo:    https://github.com/$owner/$RepoName"
Write-Host "  Actions: https://github.com/$owner/$RepoName/actions"
Write-Host "  Web:     https://guiamontilla.es (cuando el DNS apunte a Pages)"
Write-Host "`nEl cron actualiza noticias y eventos cada día a las 7:00 (hora España).`n"
