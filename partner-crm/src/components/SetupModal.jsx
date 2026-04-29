import { useState } from 'react'

const SQL = `-- Run this in your Supabase project → SQL Editor

create table if not exists partners (
  id                 uuid default gen_random_uuid() primary key,
  created_at         timestamptz default now(),
  company_name       text not null,
  country            text,
  contact_name       text,
  contact_title      text,
  contact_email      text,
  contact_phone      text,
  products           text[],
  therapeutic_area   text,
  stage              text not null default 'Lead'
    check (stage in (
      'Lead','Contacted','NDA Signed',
      'Term Sheet','Active Partner','Closed / Lost'
    )),
  priority           text not null default 'Medium'
    check (priority in ('High','Medium','Low')),
  source             text
    check (source in (
      'Conference','Referral','Cold Outreach','Inbound','Other'
    )),
  last_activity_date  date,
  next_followup_date  date
);

create table if not exists partner_notes (
  id          uuid default gen_random_uuid() primary key,
  created_at  timestamptz default now(),
  partner_id  uuid references partners(id) on delete cascade,
  content     text not null,
  author      text
);

create table if not exists projects (
  id         uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  name       text not null,
  color      text not null default '#245293'
);

create table if not exists tasks (
  id                 uuid default gen_random_uuid() primary key,
  created_at         timestamptz default now(),
  title              text not null,
  description        text,
  status             text not null default 'To Do'
    check (status in ('To Do','In Progress','Blocked','In Review','Done')),
  priority           text not null default 'Medium'
    check (priority in ('High','Medium','Low')),
  assignee           text,
  due_date           date,
  project_id         uuid references projects(id) on delete set null,
  blocked_by_task_id uuid references tasks(id) on delete set null,
  created_by         text
);

create table if not exists task_notes (
  id         uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  task_id    uuid references tasks(id) on delete cascade,
  content    text not null,
  author     text
);

-- If you already have a tasks table, run this to add the blocker column:
alter table tasks add column if not exists blocked_by_task_id uuid references tasks(id) on delete set null;`

export default function SetupModal({ onClose }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(SQL)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="px-7 py-5 border-b border-pn-border flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg font-extrabold text-pn-dark">Setup Instructions</h2>
          <button onClick={onClose} className="p-1.5 text-pn-faint hover:text-pn-dark hover:bg-pn-bg rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-7 py-6 space-y-6">

          <div>
            <h3 className="text-sm font-extrabold text-pn-dark mb-1">1. Create the Supabase tables</h3>
            <p className="text-sm text-pn-muted mb-3">
              Go to your Supabase project → <strong>SQL Editor</strong> and run the following:
            </p>
            <div className="relative">
              <pre className="bg-pn-dark text-emerald-300 text-xs rounded-xl p-4 overflow-x-auto leading-relaxed whitespace-pre">
                {SQL}
              </pre>
              <button
                onClick={copy}
                className={`absolute top-3 right-3 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  copied
                    ? 'bg-pn-green text-white'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                {copied ? '✓ Copied!' : 'Copy SQL'}
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-extrabold text-pn-dark mb-1">2. Set environment variables</h3>
            <p className="text-sm text-pn-muted mb-3">
              In Vercel → <strong>Settings → Environment Variables</strong>, add:
            </p>
            <div className="space-y-2">
              {[
                { key: 'VITE_SUPABASE_URL', hint: 'Project URL — found in Supabase Settings → API' },
                { key: 'VITE_SUPABASE_ANON_KEY', hint: 'anon / public key — same location' },
              ].map(({ key, hint }) => (
                <div key={key} className="flex items-start gap-3 bg-pn-bg border border-pn-border rounded-lg px-4 py-3">
                  <code className="text-xs font-extrabold text-pn-navy shrink-0">{key}</code>
                  <span className="text-xs text-pn-faint">{hint}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-extrabold text-pn-dark mb-1">3. Redeploy</h3>
            <p className="text-sm text-pn-muted">
              After saving the env vars, trigger a new deployment in Vercel. The app will connect automatically.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="px-7 py-4 border-t border-pn-border bg-pn-bg flex-shrink-0 flex justify-end">
          <button
            onClick={onClose}
            className="bg-pn-navy hover:bg-pn-navy-dark text-white text-sm font-bold px-6 py-2.5 rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
