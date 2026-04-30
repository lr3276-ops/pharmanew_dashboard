import TaskCard from './TaskCard.jsx'
import { TASK_STATUSES, TASK_STATUS_BORDER, TASK_STATUS_CLASSES } from '../../lib/constants.js'

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

export default function TaskBoard({ tasks, projects, onEdit }) {
  const projectMap = Object.fromEntries(projects.map(p => [p.id, p]))

  const visibleTasks = tasks.filter(t => {
    if (t.status !== 'Done') return true
    if (!t.completed_at) return true
    return Date.now() - new Date(t.completed_at).getTime() < SEVEN_DAYS_MS
  })

  const taskMap = Object.fromEntries(tasks.map(t => [t.id, t]))

  const totalByStatus = Object.fromEntries(TASK_STATUSES.map(s => [s, visibleTasks.filter(t => t.status === s).length]))

  return (
    <div className="p-6 overflow-x-auto">
      <div className="flex gap-4 min-w-max pb-4">
        {TASK_STATUSES.map(status => {
          const col = visibleTasks.filter(t => t.status === status)
          return (
            <div key={status} className="w-72 flex-shrink-0 flex flex-col">
              {/* Column header */}
              <div className={`bg-white rounded-xl border border-pn-border border-t-4 ${TASK_STATUS_BORDER[status]} mb-3 px-4 py-3 flex items-center justify-between flex-shrink-0`}>
                <span className="text-xs font-extrabold text-pn-dark uppercase tracking-wider">{status}</span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${TASK_STATUS_CLASSES[status]}`}>
                  {col.length}
                </span>
              </div>

              {/* Cards */}
              <div className="space-y-2.5 flex-1">
                {col.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    project={task.project_id ? projectMap[task.project_id] : null}
                    blockerTask={task.blocked_by_task_id ? taskMap[task.blocked_by_task_id] : null}
                    onClick={() => onEdit(task)}
                  />
                ))}
                {col.length === 0 && (
                  <div className="text-center py-10 text-pn-faint text-xs font-medium border-2 border-dashed border-pn-border rounded-xl">
                    No tasks
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
