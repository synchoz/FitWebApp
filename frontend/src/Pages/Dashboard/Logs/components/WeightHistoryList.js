import React, { useEffect, useState } from 'react';
import dashboardService from '../../../../API/Services/dashboard.service';

// Backend sends logdate as en-GB `toLocaleString()`, i.e. "DD/MM/YYYY, HH:MM:SS".
// new Date(string) parses ambiguous slash dates as MM/DD, silently corrupting any day <= 12,
// so parse the known DD/MM/YYYY layout explicitly instead.
function parseLogDate(value) {
    const [datePart] = value.split(',');
    const [day, month, year] = datePart.split('/').map(Number);
    return new Date(year, month - 1, day);
}

function formatDate(value) {
    const parsed = parseLogDate(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function WeightHistoryList({ refreshKey }) {
    const [logs, setLogs] = useState(null);

    useEffect(() => {
        dashboardService.getWeight().then(
            (result) => {
                const sorted = [...result.result].sort((a, b) => parseLogDate(b.logdate) - parseLogDate(a.logdate));
                setLogs(sorted);
            },
            () => setLogs([])
        );
    }, [refreshKey]);

    const recent = (logs || []).slice(0, 6);
    const latest = recent[0];

    return (
        <div className='bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 w-full lg:max-w-sm'>
            <div className='text-sm text-gray-500 dark:text-gray-400 mb-3'>
                {latest ? (
                    <>Latest <span className='font-semibold text-gray-800 dark:text-gray-100'>{latest.weight} kg</span> on {formatDate(latest.logdate)}</>
                ) : logs ? (
                    'No weight logs yet'
                ) : (
                    'Loading…'
                )}
            </div>
            {logs !== null && recent.length > 0 && (
                <div className='flex flex-col divide-y divide-gray-100 dark:divide-gray-700'>
                    {recent.map((log, idx) => {
                        const prev = recent[idx + 1];
                        const delta = prev ? Math.round((log.weight - prev.weight) * 100) / 100 : null;
                        return (
                            <div key={log.id} className='flex items-center justify-between py-2 text-sm'>
                                <span className='text-gray-500 dark:text-gray-400'>{formatDate(log.logdate)}</span>
                                <span className='flex items-center gap-2'>
                                    <span className='font-semibold text-gray-800 dark:text-gray-100'>{log.weight} kg</span>
                                    {delta !== null && delta !== 0 && (
                                        <span className={delta > 0 ? 'text-red-500 dark:text-red-400 text-xs w-12 text-right' : 'text-emerald-600 dark:text-emerald-400 text-xs w-12 text-right'}>
                                            {delta > 0 ? '+' : ''}{delta}
                                        </span>
                                    )}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
