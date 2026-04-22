import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import Sidebar from './_components/Sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login')

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar repName={session.repName} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
