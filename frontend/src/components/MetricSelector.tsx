import { metricLabel } from "../constants/metrics";

interface Props {
  availableMetrics: string[];
  selectedMetrics: string[];
  onToggle: (metric: string) => void;
}

function MetricSelector({
  availableMetrics,
  selectedMetrics,
  onToggle,
}: Props) {
  return (
    <div className="metric-selector">
      {availableMetrics.map((metric) => (
        <label key={metric} className="metric-selector__item">
          <input
            type="checkbox"
            checked={selectedMetrics.includes(metric)}
            onChange={() => onToggle(metric)}
          />
          {metricLabel(metric)}
        </label>
      ))}
    </div>
  );
}

export default MetricSelector;
