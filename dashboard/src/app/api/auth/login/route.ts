import { NextRequest, NextResponse } from 'next/server'
import { createToken } from '@/lib/auth'
import { REPS } from '@/lib/constants'

export async function POST(request: NextRequest) {
  const { repName, password } = await request.json()

  if (!REPS.includes(repName) || password !== process.env.DASHBOARD_PASSWORD) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const token = await createToken(repName)
  const response = NextResponse.json({ ok: true })
  response.cookies.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
  return response
}
