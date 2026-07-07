import type { JSX } from 'react'
import type { Trend } from '../types/evolution'
import { TREND_ARROWS, TREND_COLORS, TREND_LABELS } from '../constants/metrics'

interface Props {
  trend: Trend
}

function TrendBadge({ trend }: Props): JSX.Element {
  return (
    <span className="trend-badge" style={{ color: TREND_COLORS[trend], borderColor: TREND_COLORS[trend] }}>
      {TREND_ARROWS[trend]} {TREND_LABELS[trend]}
    </span>
  )
}

export default TrendBadge
