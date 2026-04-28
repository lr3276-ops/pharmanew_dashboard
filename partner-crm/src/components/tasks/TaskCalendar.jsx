import { useState } from 'react'
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, isToday, isPast, parseISO,
} from 'date-fns'

export default function TaskCalendar({ tasks, projects, onEdit }) {
  const [current, setCurrent] = useState(new Date())
  const projectMap = Object.fromEntries(projects.map(p => [p.id, p]))

  const monthStart = startOfMonth(current)
  const monthEnd = endOfMonth(current)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
  const days = eachDayOfInterval({ start: calStart, end: calEnd })

  function tasksForDay(day) {
    return tasks.filter(t => t.due_date && isSameDay(parseISO(t.due_date), day))
  }

  const doneTasks = tasks.filter(t => t.status === 'Done').length
  const overdueTasks = tasks.filter(t =>
    t.due_date && t.status !== 'Done' && isPast(parseISO(t.due_date + 'T23:59:59'))
  ).length

  return (
    <div className="p-6 max-w-6xl">
      {/* Summary pills */}
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-white border border-pn-border rounded-lg px-4 py-2 flex items-center gap-2">
          <span className="text-xs font-bold text-pn-faint uppercase tracking-wider">Total</span>
          <span className="text-sm font-extrabold text-pn-navy">{tasks.length}</span>
        </div>
        <div className="bg-white border border-pn-border rounded-lg px-4 py-2 flex items-center gap-2">
          <span className="text-xs font-bold text-pn-faint uppercase tracking-wider">Done</span>
          <span className="text-sm font-extrabold text-pn-green">{doneTasks}</span>
        </div>
        {overdueTasks > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 flex items-center gap-2">
            <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Overdue</span>
            <span className="text-sm font-extrabold text-red-600">{overdueTasks}</span>
          </div>
        )}
      </div>

      {/* Calendar header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-extrabold text-pn-dark">
          {format(current, 'MMMM yyyy')}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrent(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
            className="p-2 rounded-lg hover:bg-pn-bg border border-pn-border text-pn-muted hover:text-pn-dark transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => setCurrent(new Date())}
            className="px-3 py-1.5 text-xs font-bold text-pn-navy border border-pn-border rounded-lg hover:bg-pn-bg transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => setCurrent(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
            className="p-2 rounded-lg hover:bg-pn-bg border border-pn-border text-pn-muted hover:text-pn-dark transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 mb-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="text-center text-xs font-bold text-pn-faint uppercase tracking-wider py-2">
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 border-l border-t border-pn-border rounded-xl overflow-hidden shadow-sm">
        {days.map(day => {
          const dayTasks = tasksForDay(day)
          const inMonth = isSameMonth(day, current)
          const todayFlag = isToday(day)

          return (
            <div
              key={day.toISOString()}
              className={`border-r border-b border-pn-border min-h-[110px] p-2 ${
                inMonth ? 'bg-white' : 'bg-pn-bg/60'
              }`}
            >
              {/* Day number */}
              <p className={`text-xs font-bold mb-1.5 w-6 h-6 flex items-center justify-center rounded-full leading-none ${
                todayFlag
                  ? 'bg-pn-navy text-white'
                  : inMonth ? 'text-pn-dark' : 'text-pn-faint'
              }`}>
                {format(day, 'd')}
              </p>

              {/* Task pills */}
              <div className="space-y-1">
                {dayTasks.slice(0, 3).map(task => {
                  const project = task.project_id ? projectMap[task.project_id] : null
                  const overdue = task.status !== 'Done' && isPast(parseISO(task.due_date + 'T23:59:59'))
                  const color = overdue ? '#dc2626' : project ? project.color : '#8a9aaa'
                  const bg = overdue ? '#fee2e2' : project ? project.color + '22' : '#f4f7fb'

                  return (
                    <button
                      key={task.id}
                      onClick={() => onEdit(task)}
                      className="w-full text-left px-1.5 py-0.5 rounded text-[11px] font-semibold truncate transition-opacity hover:opacity-75"
                      style={{ backgroundColor: bg, color, borderLeft: `2px solid ${color}` }}
                    >
                      {task.title}
                    </button>
                  )
                })}
                {dayTasks.length > 3 && (
                  <p className="text-[10px] text-pn-faint font-bold pl-1">+{dayTasks.length - 3} more</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
