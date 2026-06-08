import { cookies } from 'next/headers'
import { jwtVerify, SignJWT } from 'jose'

const getSecret = () => new TextEncoder().encode(process.env.SESSION_SECRET!)

export async function createToken(repName: string): Promise<string> {
  return new SignJWT({ repName })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(getSecret())
}

export async function getSession(): Promise<{ repName: string } | null> {
  try {
    const token = cookies().get('session')?.value
    if (!token) return null
    const { payload } = await jwtVerify(token, getSecret())
    return { repName: payload.repName as string }
  } catch {
    return null
  }
}
