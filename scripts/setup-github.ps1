# Configura GitHub + Pages + primer despliegue automatico
# Uso: .\scripts\setup-github.ps1

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
  gh auth status | Out-Null
  if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Inicia sesion en GitHub (se abrira el navegador)..." -ForegroundColor Yellow
    Write-Host ""
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
    git -c user.name="Guia Montilla" -c user.email="bot@guia-montilla.local" commit -m "Guia Montilla listo para publicar"
  }
}

Write-Host "=== Guia Montilla - setup GitHub ===" -ForegroundColor Cyan
Require-Gh
Ensure-Commit

$owner = (gh api user -q .login)
$hasOrigin = @(git remote) -contains "origin"

if (-not $hasOrigin) {
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
gh api -X PUT "/repos/$owner/$RepoName/actions/permissions" -f enabled=true -f allowed_actions=all | Out-Null
gh api -X PUT "/repos/$owner/$RepoName/actions/permissions/workflow" -f default_workflow_permissions=write -f can_approve_pull_request_reviews=false | Out-Null

gh secret set SITE_URL --body "https://guiamontilla.es" 2>$null

if ($Web3FormsKey) {
  gh secret set PUBLIC_WEB3FORMS_KEY --body $Web3FormsKey
  Write-Host "Secret PUBLIC_WEB3FORMS_KEY guardado." -ForegroundColor Green
} else {
  Write-Host "Aviso: sin PUBLIC_WEB3FORMS_KEY los formularios no enviaran email en produccion." -ForegroundColor Yellow
  Write-Host "  Anadelo despues: gh secret set PUBLIC_WEB3FORMS_KEY" -ForegroundColor Yellow
}

Write-Host "Lanzando primer despliegue ..." -ForegroundColor Green
gh workflow run "Actualizar y publicar"

Write-Host ""
Write-Host "Listo." -ForegroundColor Cyan
Write-Host "  Repo:    https://github.com/$owner/$RepoName"
Write-Host "  Actions: https://github.com/$owner/$RepoName/actions"
Write-Host "  Web:     https://guiamontilla.es (cuando el DNS apunte a Pages)"
Write-Host ""
Write-Host "El cron actualiza noticias y eventos cada dia a las 7:00 (hora Espana)."
Write-Host ""
