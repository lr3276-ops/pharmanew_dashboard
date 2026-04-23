'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'

function IconDashboard({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/>
      <rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>
    </svg>
  )
}
function IconLogs({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 5h1"/><path d="M3 12h1"/><path d="M3 19h1"/>
      <path d="M8 5h1"/><path d="M8 12h1"/><path d="M8 19h1"/>
      <path d="M13 5h8"/><path d="M13 12h8"/><path d="M13 19h8"/>
    </svg>
  )
}
function IconBriefcaseMedical({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 11v4"/><path d="M14 13h-4"/>
      <path d="M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
      <path d="M18 6v14"/><path d="M6 6v14"/>
      <rect width="20" height="14" x="2" y="6" rx="2"/>
    </svg>
  )
}
function IconLogOut({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    </svg>
  )
}

const NAV = [
  { href: '/dashboard',           label: 'Overview',     Icon: IconDashboard },
  { href: '/dashboard/log',       label: 'Log Activity', Icon: IconLogs },
  { href: '/dashboard/providers', label: 'Providers',    Icon: IconBriefcaseMedical },
]

export default function Sidebar({ repName }: { repName: string }) {
  const pathname = usePathname()
  const router = useRouter()

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <aside className="w-56 bg-pn-navy min-h-screen flex flex-col flex-shrink-0">
      <div className="px-5 py-4 border-b border-white/10 flex items-center justify-center min-h-[72px]">
        <Image
          src="/logo-landscape.png"
          alt="PharmaNew"
          width={160}
          height={52}
          className="object-contain"
          priority
        />
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ href, label, Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-pn-green text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <div className="px-3 py-2 mb-1">
          <p className="text-white/40 text-xs uppercase tracking-wider font-semibold">Signed in as</p>
          <p className="text-white text-sm font-semibold mt-0.5">{repName}</p>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-white/50 hover:text-white text-sm rounded-lg hover:bg-white/10 transition-colors"
        >
          <IconLogOut className="w-4 h-4 flex-shrink-0" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
