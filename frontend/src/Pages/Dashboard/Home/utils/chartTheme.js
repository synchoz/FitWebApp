// Matches the app's Tailwind palette (indigo-500 accent) and the light-mode
// chart chrome/ink values from the dataviz design-system reference, so charts
// read as part of the same UI as the surrounding cards rather than default
// ECharts styling.

export const CHART_COLORS = {
    indigo: '#6366f1',
    amber: '#f59e0b',
    emerald: '#10b981',
};

export const axisTextStyle = {
    color: '#898781',
    fontSize: 12,
};

export const axisLineStyle = {
    lineStyle: { color: '#e1e0d9' },
};

export const splitLineStyle = {
    lineStyle: { color: '#e1e0d9', type: 'dashed' },
};

export const tooltipStyle = {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    borderWidth: 1,
    textStyle: { color: '#111827', fontSize: 12 },
    extraCssText: 'border-radius: 10px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); padding: 8px 12px;',
};

export const legendTextStyle = {
    color: '#52514e',
    fontSize: 12,
};
