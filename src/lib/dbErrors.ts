export function getDatabaseErrorMessage(err: unknown, fallback: string) {
  const msg = err instanceof Error ? err.message : String(err)

  if (!process.env.DATABASE_URL) {
    return 'DATABASE_URL não está configurada. Crie um arquivo .env na raiz do projeto.'
  }

  if (!process.env.DIRECT_URL) {
    return 'DIRECT_URL não está configurada. Copie .env.example para .env e preencha as variáveis.'
  }

  if (
    msg.includes('P1001') ||
    msg.includes("Can't reach database") ||
    msg.includes('ECONNREFUSED') ||
    msg.includes('Connection refused')
  ) {
    return 'Não foi possível conectar ao banco. Verifique se o PostgreSQL está rodando e se DATABASE_URL/DIRECT_URL estão corretas.'
  }

  if (msg.includes('P1000') || msg.includes('Authentication failed')) {
    return 'Falha de autenticação no banco. Confira usuário e senha em DATABASE_URL e DIRECT_URL.'
  }

  if (msg.includes('P1003') || msg.includes('does not exist')) {
    return 'O banco de dados não existe. Crie o banco "boletim" ou rode: npx prisma migrate deploy'
  }

  if (msg.includes('P2021') || msg.includes('does not exist in the current database')) {
    return 'Tabelas não encontradas. Rode: npx prisma migrate deploy'
  }

  if (process.env.NODE_ENV === 'development') {
    return `${fallback} (${msg})`
  }

  return fallback
}
