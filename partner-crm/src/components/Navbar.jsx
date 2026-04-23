export default function Navbar({ view, setView, onAddPartner, onSetup, totalCount }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-pn-border h-16 flex items-center">
      <div className="w-full px-6 flex items-center justify-between gap-4">

        {/* Wordmark */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <img
            src="/logo-landscape.png"
            alt="PHARMAnew"
            className="h-9 object-contain"
          />
          <div className="h-5 w-px bg-pn-border" />
          <span className="text-xs font-extrabold text-pn-faint uppercase tracking-widest whitespace-nowrap">
            Partner Pipeline
          </span>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 bg-pn-bg border border-pn-border rounded-lg p-1">
          <button
            onClick={() => setView('kanban')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
              view === 'kanban'
                ? 'bg-white text-pn-navy shadow-sm'
                : 'text-pn-faint hover:text-pn-dark'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <rect x="3" y="3" width="7" height="9" rx="1"/>
              <rect x="14" y="3" width="7" height="5" rx="1"/>
              <rect x="14" y="12" width="7" height="9" rx="1"/>
              <rect x="3" y="16" width="7" height="5" rx="1"/>
            </svg>
            Kanban
          </button>
          <button
            onClick={() => setView('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
              view === 'list'
                ? 'bg-white text-pn-navy shadow-sm'
                : 'text-pn-faint hover:text-pn-dark'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>
            </svg>
            List
          </button>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {totalCount > 0 && (
            <span className="text-xs text-pn-faint font-medium hidden sm:block">
              {totalCount} partner{totalCount !== 1 ? 's' : ''}
            </span>
          )}
          <button
            onClick={onSetup}
            className="px-3 py-1.5 text-xs font-bold text-pn-faint hover:text-pn-muted transition-colors rounded-lg hover:bg-pn-bg"
          >
            Setup
          </button>
          <button
            onClick={onAddPartner}
            className="flex items-center gap-1.5 bg-pn-green hover:bg-pn-green-dark text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Partner
          </button>
        </div>
      </div>
    </nav>
  )
}
