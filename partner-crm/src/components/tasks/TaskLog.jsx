import { format, parseISO } from 'date-fns'
import { TASK_STATUS_CLASSES, PRIORITY_CLASSES } from '../../lib/constants.js'

const STATUS_ORDER = ['Blocked', 'In Progress', 'To Do', 'In Review', 'Done']

export default function TaskLog({ tasks, projects, onEdit }) {
  const projectMap = Object.fromEntries(projects.map(p => [p.id, p]))

  const sorted = [...tasks].sort((a, b) => {
    const si = STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status)
    if (si !== 0) return si
    return new Date(b.created_at) - new Date(a.created_at)
  })

  if (sorted.length === 0) {
    return (
      <div className="p-6 flex items-center justify-center h-64 text-pn-faint text-sm font-medium">
        No tasks yet.
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-xl border border-pn-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-pn-border bg-pn-bg">
              <th className="text-left px-4 py-3 text-xs font-bold text-pn-faint uppercase tracking-wider">Task</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-pn-faint uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-pn-faint uppercase tracking-wider">Priority</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-pn-faint uppercase tracking-wider">Project</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-pn-faint uppercase tracking-wider">Assignee</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-pn-faint uppercase tracking-wider">Due</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-pn-faint uppercase tracking-wider">Completed</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((task, i) => {
              const project = task.project_id ? projectMap[task.project_id] : null
              return (
                <tr
                  key={task.id}
                  onClick={() => onEdit(task)}
                  className={`cursor-pointer hover:bg-pn-bg transition-colors ${
                    i < sorted.length - 1 ? 'border-b border-pn-border' : ''
                  } ${task.status === 'Done' ? 'opacity-60' : ''}`}
                >
                  <td className="px-4 py-3 max-w-xs">
                    <p className={`font-semibold text-pn-dark truncate ${task.status === 'Done' ? 'line-through' : ''}`}>
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-xs text-pn-faint truncate mt-0.5">{task.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${TASK_STATUS_CLASSES[task.status]}`}>
                      {task.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${PRIORITY_CLASSES[task.priority]}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {project ? (
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: project.color }} />
                        <span className="text-xs text-pn-muted truncate">{project.name}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-pn-faint">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-pn-muted">
                    {task.assignee || <span className="text-pn-faint">—</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-pn-muted whitespace-nowrap">
                    {task.due_date ? format(parseISO(task.due_date), 'MMM d, yyyy') : <span className="text-pn-faint">—</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-pn-muted whitespace-nowrap">
                    {task.completed_at
                      ? format(parseISO(task.completed_at), 'MMM d, yyyy')
                      : <span className="text-pn-faint">—</span>
                    }
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
