// Matches the app's Tailwind palette (indigo-500 accent) and the light-mode
// chart chrome/ink values from the dataviz design-system reference, so charts
// read as part of the same UI as the surrounding cards rather than default
// ECharts styling. Dark-mode variants mirror the same relationships against
// the app's dark surface (gray-800/gray-900) palette.

export const CHART_COLORS = {
    indigo: '#6366f1',
    amber: '#f59e0b',
    emerald: '#10b981',
};

export function getChartTheme(isDark) {
    return {
        axisTextStyle: {
            color: isDark ? '#9ca3af' : '#898781',
            fontSize: 12,
        },
        axisLineStyle: {
            lineStyle: { color: isDark ? '#374151' : '#e1e0d9' },
        },
        splitLineStyle: {
            lineStyle: { color: isDark ? '#374151' : '#e1e0d9', type: 'dashed' },
        },
        tooltipStyle: {
            backgroundColor: isDark ? '#1f2937' : '#ffffff',
            borderColor: isDark ? '#374151' : '#e5e7eb',
            borderWidth: 1,
            textStyle: { color: isDark ? '#f3f4f6' : '#111827', fontSize: 12 },
            extraCssText: 'border-radius: 10px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); padding: 8px 12px;',
        },
        legendTextStyle: {
            color: isDark ? '#d1d5db' : '#52514e',
            fontSize: 12,
        },
    };
}
