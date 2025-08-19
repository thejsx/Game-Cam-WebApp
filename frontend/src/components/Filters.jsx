import React, { useMemo } from 'react'

function group(title, all, selected, onToggleAll, onToggleItem) {
  return (
    <div className="filterGroup" data-filter-list>
      <div className="filterHeader">
        <span>{title}</span>
        <button className="small" onClick={() => onToggleAll(title)}>
          {selected.length === all.length ? 'Clear' : 'All'}
        </button>
      </div>
      <div className="filterList">
        {all.map(v => {
          const isChecked = selected.includes(v)
          return (
            <label key={v} className={`chip ${isChecked ? 'checked' : ''}`}>
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => onToggleItem(title, v)}
              />
              {v}
            </label>
          )
        })}
      </div>
    </div>
  )
}

export default function Filters({ options, filters, onChange }) {
  const { sites, animals, actions, addLabels, minDate, maxDate } = options

  const dateStr = (d) => d.toISOString().slice(0, 10)

  const handlers = useMemo(() => ({
    toggleAll: (key) => {
      const map = {
        'Cam Sites': 'sites',
        'Animals': 'animals',
        'Actions': 'actions',
        "Addt'l Labels": 'addLabels'
      }
      const k = map[key]
      const all = { sites, animals, actions, addLabels }[k]
      const next = { ...filters, [k]: filters[k].length === all.length ? [] : all.slice() }
      onChange(next)
    },
    toggleItem: (key, val) => {
      const map = {
        'Cam Sites': 'sites',
        'Animals': 'animals',
        'Actions': 'actions',
        "Addt'l Labels": 'addLabels'
      }
      const k = map[key]
      const set = new Set(filters[k])
      if (set.has(val)) set.delete(val)
      else set.add(val)
      onChange({ ...filters, [k]: Array.from(set) })
    },
    changeDate: (which, value) => {
      const d = new Date(value + 'T00:00:00')
      const [s, e] = filters.dateRange
      const next = which === 'start' ? [d, e] : [s, new Date(value + 'T23:59:59')]
      onChange({ ...filters, dateRange: next })
    }
  }), [filters, onChange, sites, animals, actions, addLabels])

  return (
    <div className="filters">
      {group('Cam Sites', sites, filters.sites, handlers.toggleAll, handlers.toggleItem)}
      {group('Animals', animals, filters.animals, handlers.toggleAll, handlers.toggleItem)}
      {group('Actions', actions, filters.actions, handlers.toggleAll, handlers.toggleItem)}
      {group("Addt'l Labels", addLabels, filters.addLabels, handlers.toggleAll, handlers.toggleItem)}

      <div className="dates" data-filter-list>
        <label>
          Start
          <input
            type="date"
            min={dateStr(minDate)}
            max={dateStr(maxDate)}
            value={dateStr(filters.dateRange[0])}
            onChange={(e) => handlers.changeDate('start', e.target.value)}
          />
        </label>
        <label>
          End
          <input
            type="date"
            min={dateStr(minDate)}
            max={dateStr(maxDate)}
            value={dateStr(filters.dateRange[1])}
            onChange={(e) => handlers.changeDate('end', e.target.value)}
          />
        </label>
      </div>
    </div>
  )
}
