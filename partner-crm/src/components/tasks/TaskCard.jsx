import { format, isPast, isToday, parseISO } from 'date-fns'
import { PRIORITY_CLASSES } from '../../lib/constants.js'

export default function TaskCard({ task, project, blockerTask, onClick }) {
  const overdue = task.due_date && task.status !== 'Done' && isPast(parseISO(task.due_date + 'T23:59:59'))
  const dueToday = task.due_date && task.status !== 'Done' && isToday(parseISO(task.due_date))

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border border-pn-border p-3.5 cursor-pointer hover:shadow-md hover:border-pn-border-mid transition-all group"
    >
      {/* Project tag */}
      {project && (
        <div className="flex items-center gap-1.5 mb-2">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: project.color }} />
          <span className="text-[11px] font-bold text-pn-faint truncate">{project.name}</span>
        </div>
      )}

      {/* Title */}
      <p className={`text-sm font-semibold leading-snug mb-2.5 group-hover:text-pn-navy transition-colors ${
        task.status === 'Done' ? 'text-pn-faint line-through' : 'text-pn-dark'
      }`}>
        {task.title}
      </p>

      {/* Description preview */}
      {task.description && (
        <p className="text-xs text-pn-faint leading-relaxed mb-2.5 line-clamp-2">{task.description}</p>
      )}

      {/* Blocker indicator */}
      {blockerTask && (
        <div className="flex items-center gap-1 mb-2.5">
          <svg className="w-3 h-3 text-orange-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <span className="text-[11px] font-semibold text-orange-600 truncate">
            Blocked by: {blockerTask.title}
          </span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-2">
        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${PRIORITY_CLASSES[task.priority]}`}>
          {task.priority}
        </span>
        <div className="flex items-center gap-2">
          {task.due_date && (
            <span className={`text-[11px] font-semibold ${
              overdue ? 'text-red-600' : dueToday ? 'text-amber-600' : 'text-pn-faint'
            }`}>
              {overdue && '⚠ '}
              {format(parseISO(task.due_date), 'MMM d')}
            </span>
          )}
          {task.assignee && (
            <div className="w-5 h-5 rounded-full bg-pn-navy flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-bold text-white leading-none">
                {task.assignee.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
