import type { JSX } from 'react'
import { metricLabel } from '../constants/metrics'

interface Props {
  availableMetrics: string[]
  selectedMetrics: string[]
  onToggle: (metric: string) => void
}

function MetricSelector({ availableMetrics, selectedMetrics, onToggle }: Props): JSX.Element {
  return (
    <div className="metric-selector">
      {availableMetrics.map((metric: string) => (
        <label key={metric} className="metric-selector__item">
          <input
            type="checkbox"
            checked={selectedMetrics.includes(metric)}
            onChange={(): void => onToggle(metric)}
          />
          {metricLabel(metric)}
        </label>
      ))}
    </div>
  )
}

export default MetricSelector
