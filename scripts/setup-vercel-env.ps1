# Configura DATABASE_URL e DIRECT_URL na Vercel e dispara redeploy.
#
# Pré-requisito: estar logado na Vercel CLI (npx vercel login)
#
# Uso:
#   .\scripts\setup-vercel-env.ps1 `
#     -DatabaseUrl "postgresql://postgres.[REF]:[SENHA]@...pooler.supabase.com:6543/postgres?pgbouncer=true" `
#     -DirectUrl "postgresql://postgres.[REF]:[SENHA]@db.[REF].supabase.co:5432/postgres"

param(
    [Parameter(Mandatory = $true)]
    [string]$DatabaseUrl,

    [Parameter(Mandatory = $true)]
    [string]$DirectUrl,

    [Parameter(Mandatory = $false)]
    [string[]]$Environments = @("production", "preview", "development")
)

$ErrorActionPreference = "Stop"

Write-Host ">> Verificando login na Vercel..."
npx vercel whoami

foreach ($envName in $Environments) {
    Write-Host ""
    Write-Host ">> Configurando DATABASE_URL ($envName)..."
    $DatabaseUrl | npx vercel env add DATABASE_URL $envName --force

    Write-Host ">> Configurando DIRECT_URL ($envName)..."
    $DirectUrl | npx vercel env add DIRECT_URL $envName --force
}

Write-Host ""
Write-Host ">> Disparando redeploy em produção..."
npx vercel --prod

Write-Host ""
Write-Host "Pronto. Teste login em https://boletim-escolar.vercel.app/"
