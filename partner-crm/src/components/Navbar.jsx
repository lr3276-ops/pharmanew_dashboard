export default function Navbar({
  section, setSection,
  view, setView,
  onAdd = null, onSetup,
  onSignOut, userEmail,
}) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-pn-border h-16 flex items-center">
      <div className="w-full px-6 flex items-center justify-between gap-4">

        {/* Logo + section switcher */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <img src="/logo-landscape.png" alt="PHARMAnew" className="h-9 object-contain" />
          <div className="h-5 w-px bg-pn-border" />
          <div className="flex items-center gap-1 bg-pn-bg border border-pn-border rounded-lg p-1">
            <button
              onClick={() => setSection('crm')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors whitespace-nowrap ${
                section === 'crm' ? 'bg-white text-pn-navy shadow-sm' : 'text-pn-faint hover:text-pn-dark'
              }`}
            >
              Partner Pipeline
            </button>
            <button
              onClick={() => setSection('tasks')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors whitespace-nowrap ${
                section === 'tasks' ? 'bg-white text-pn-navy shadow-sm' : 'text-pn-faint hover:text-pn-dark'
              }`}
            >
              Team Tasks
            </button>
            <button
              onClick={() => setSection('projects')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors whitespace-nowrap ${
                section === 'projects' ? 'bg-white text-pn-navy shadow-sm' : 'text-pn-faint hover:text-pn-dark'
              }`}
            >
              Deal Projects
            </button>
          </div>
        </div>

        {/* View toggle — hidden for Deal Projects section */}
        {section !== 'projects' && <div className="flex items-center gap-1 bg-pn-bg border border-pn-border rounded-lg p-1">
          {section === 'crm' ? (
            <>
              <button onClick={() => setView('kanban')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                  view === 'kanban' ? 'bg-white text-pn-navy shadow-sm' : 'text-pn-faint hover:text-pn-dark'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/>
                  <rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>
                </svg>
                Kanban
              </button>
              <button onClick={() => setView('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                  view === 'list' ? 'bg-white text-pn-navy shadow-sm' : 'text-pn-faint hover:text-pn-dark'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>
                </svg>
                List
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setView('kanban')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                  view === 'kanban' ? 'bg-white text-pn-navy shadow-sm' : 'text-pn-faint hover:text-pn-dark'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/>
                  <rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>
                </svg>
                Board
              </button>
              <button onClick={() => setView('calendar')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                  view === 'calendar' ? 'bg-white text-pn-navy shadow-sm' : 'text-pn-faint hover:text-pn-dark'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <path d="M16 2v4M8 2v4M3 10h18"/>
                </svg>
                Calendar
              </button>
              <button onClick={() => setView('log')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                  view === 'log' ? 'bg-white text-pn-navy shadow-sm' : 'text-pn-faint hover:text-pn-dark'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>
                </svg>
                Log
              </button>
              <button onClick={() => setView('projects')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                  view === 'projects' ? 'bg-white text-pn-navy shadow-sm' : 'text-pn-faint hover:text-pn-dark'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/>
                </svg>
                Projects
              </button>
            </>
          )}
        </div>}

        {/* Right actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {section === 'crm' && (
            <button onClick={onSetup}
              className="px-3 py-1.5 text-xs font-bold text-pn-faint hover:text-pn-muted transition-colors rounded-lg hover:bg-pn-bg">
              Setup
            </button>
          )}
          {onAdd && (
            <button
              onClick={onAdd}
              className={`flex items-center gap-1.5 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors ${
                section === 'crm' ? 'bg-pn-green hover:bg-pn-green-dark' : 'bg-pn-navy hover:bg-pn-navy-dark'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              {section === 'crm' ? 'Add Partner' : 'Add Task'}
            </button>
          )}

          {/* User / sign out */}
          <div className="flex items-center gap-2 pl-3 ml-1 border-l border-pn-border">
            <span className="text-xs text-pn-faint hidden lg:block truncate max-w-[140px]">{userEmail}</span>
            <button
              onClick={onSignOut}
              title="Sign out"
              className="p-1.5 text-pn-faint hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
