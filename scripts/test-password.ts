import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🔐 Testando validação de senhas...\n')

  // Buscar usuário admin
  const admin = await prisma.user.findUnique({
    where: { email: 'admin@scalebeam.com' },
  })

  if (!admin) {
    console.log('❌ Usuário admin não encontrado')
    return
  }

  console.log('👤 Usuário encontrado:', admin.email)
  console.log('📝 Tem passwordHash?', admin.passwordHash ? 'SIM ✅' : 'NÃO ❌')
  console.log('')

  if (!admin.passwordHash) {
    console.log('⚠️  ATENÇÃO: Usuário não tem passwordHash!')
    console.log('Execute: npm run db:reset:seed')
    return
  }

  // Testar senha correta
  console.log('🧪 Teste 1: Senha CORRETA (admin123)')
  const validPassword = await bcrypt.compare('admin123', admin.passwordHash)
  console.log(`   Resultado: ${validPassword ? '✅ PASSOU' : '❌ FALHOU'}`)
  console.log('')

  // Testar senha incorreta
  console.log('🧪 Teste 2: Senha INCORRETA (wrongpassword)')
  const invalidPassword = await bcrypt.compare('wrongpassword', admin.passwordHash)
  console.log(`   Resultado: ${invalidPassword ? '❌ FALHOU (deveria rejeitar)' : '✅ PASSOU (rejeitou corretamente)'}`)
  console.log('')

  // Testar usuário client
  const client = await prisma.user.findUnique({
    where: { email: 'client@scalebeam.com' },
  })

  if (!client) {
    console.log('❌ Usuário client não encontrado')
    return
  }

  console.log('👤 Usuário client:', client.email)
  console.log('🧪 Teste 3: Senha CORRETA (client123)')
  const validClientPassword = await bcrypt.compare('client123', client.passwordHash)
  console.log(`   Resultado: ${validClientPassword ? '✅ PASSOU' : '❌ FALHOU'}`)
  console.log('')

  if (validPassword && !invalidPassword && validClientPassword) {
    console.log('✅ TODOS OS TESTES PASSARAM!')
    console.log('✅ Sistema de autenticação está funcionando corretamente')
    console.log('')
    console.log('📝 Credenciais válidas:')
    console.log('   Admin:  admin@scalebeam.com / admin123')
    console.log('   Client: client@scalebeam.com / client123')
  } else {
    console.log('❌ ALGUNS TESTES FALHARAM')
    console.log('Execute: npm run db:reset:seed para resetar o banco')
  }
}

main()
  .catch((error) => {
    console.error('❌ Erro:', error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
