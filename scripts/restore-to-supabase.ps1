# Restaura backup do Supabase em um projeto NOVO e aplica migrations do Prisma.
#
# Uso:
#   .\scripts\restore-to-supabase.ps1 `
#     -DirectUrl "postgresql://postgres.[REF]:[SENHA]@db.[REF].supabase.co:5432/postgres" `
#     -BackupPath "C:\Users\janie\Downloads\db_cluster-18-06-2025@14-29-21.backup\db_cluster-18-06-2025@14-29-21.backup"
#
# Depois configure a Vercel (ver scripts\setup-vercel-env.ps1).

param(
    [Parameter(Mandatory = $true)]
    [string]$DirectUrl,

    [Parameter(Mandatory = $false)]
    [string]$BackupPath = "$env:USERPROFILE\Downloads\db_cluster-18-06-2025@14-29-21.backup\db_cluster-18-06-2025@14-29-21.backup",

    [Parameter(Mandatory = $false)]
    [string]$PoolerUrl = ""
)

$ErrorActionPreference = "Stop"

$psqlCandidates = @(
    "C:\Program Files\PostgreSQL\17\bin\psql.exe",
    "C:\Program Files\PostgreSQL\16\bin\psql.exe"
)

$psql = $psqlCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $psql) {
    throw "psql não encontrado. Instale PostgreSQL ou adicione psql ao PATH."
}

if (-not (Test-Path $BackupPath)) {
    throw "Backup não encontrado: $BackupPath"
}

Write-Host ">> Restaurando backup no Supabase (pode levar alguns minutos)..."
Write-Host ">> Erros de 'already exists' são normais no projeto novo."

& $psql $DirectUrl -v ON_ERROR_STOP=0 -f $BackupPath 2>&1 | Tee-Object -FilePath "restore-supabase.log"

Write-Host ""
Write-Host ">> Aplicando migrations do Prisma (User, Session, SchoolReport...)..."

if ($PoolerUrl) {
    $env:DATABASE_URL = $PoolerUrl
} else {
    $env:DATABASE_URL = $DirectUrl
}
$env:DIRECT_URL = $DirectUrl

Push-Location (Join-Path $PSScriptRoot "..")
try {
    npx prisma migrate deploy
} finally {
    Pop-Location
}

Write-Host ""
Write-Host "Concluído."
Write-Host "- Log da restauração: restore-supabase.log"
Write-Host "- IMPORTANTE: o backup não tinha tabelas User/Session. Usuários precisam se cadastrar de novo no site."
Write-Host "- Próximo passo: .\scripts\setup-vercel-env.ps1"
