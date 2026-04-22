export async function GET() {
  const checks = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '3.0.0',
    services: {
      api: 'ok',
      anthropic: process.env.ANTHROPIC_API_KEY ? 'configured' : 'missing_key',
      avinode: process.env.AVINODE_API_KEY ? 'configured' : 'mock_mode',
      stripe: process.env.STRIPE_SECRET_KEY ? 'configured' : 'missing_key',
      resend: process.env.RESEND_API_KEY ? 'configured' : 'dev_mode',
      database: process.env.DATABASE_URL ? 'configured' : 'sqlite_dev',
    },
    environment: process.env.NODE_ENV,
  }

  const allOk = Object.values(checks.services).every(v => !v.includes('missing'))
  return Response.json(checks, { status: allOk ? 200 : 207 })
}
