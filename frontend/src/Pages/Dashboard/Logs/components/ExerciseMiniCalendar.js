import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import dashboardService from '../../../../API/Services/dashboard.service';
import { todayIso } from '../../../../utils/date';

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function pad(n) {
    return String(n).padStart(2, '0');
}

function isoFromParts(year, month, day) {
    return `${year}-${pad(month)}-${pad(day)}`;
}

function daysAgo(dateStr) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const [ty, tm, td] = todayIso().split('-').map(Number);
    const target = Date.UTC(y, m - 1, d);
    const today = Date.UTC(ty, tm - 1, td);
    return Math.round((today - target) / 86400000);
}

function formatDaysAgo(days) {
    if (days === 0) return 'today';
    if (days === 1) return 'yesterday';
    return `${days} days ago`;
}

export default function ExerciseMiniCalendar({ selectedDate, onSelectDate }) {
    const [exerciseDates, setExerciseDates] = useState(null);
    const [visibleMonth, setVisibleMonth] = useState(() => {
        const [y, m] = (selectedDate || todayIso()).split('-').map(Number);
        return new Date(y, m - 1, 1);
    });

    useEffect(() => {
        dashboardService.getExerciseDates().then(
            (data) => setExerciseDates(new Set(data.result)),
            () => setExerciseDates(new Set())
        );
    }, []);

    useEffect(() => {
        if (!selectedDate) return;
        const [y, m] = selectedDate.split('-').map(Number);
        setVisibleMonth((current) => (
            current.getFullYear() === y && current.getMonth() === m - 1
                ? current
                : new Date(y, m - 1, 1)
        ));
    }, [selectedDate]);

    const lastExercisedDate = useMemo(() => {
        if (!exerciseDates || exerciseDates.size === 0) return null;
        return [...exerciseDates].sort().pop();
    }, [exerciseDates]);

    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const monthLabel = visibleMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < firstWeekday; i++) {
        cells.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
        cells.push(day);
    }

    const goToMonth = (offset) => {
        setVisibleMonth(new Date(year, month + offset, 1));
    };

    const today = todayIso();

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 w-full sm:max-w-xs">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                {lastExercisedDate ? (
                    <>Last exercised <span className="font-semibold text-gray-800 dark:text-gray-100">{formatDaysAgo(daysAgo(lastExercisedDate))}</span></>
                ) : exerciseDates ? (
                    'No exercises logged yet'
                ) : (
                    'Loading…'
                )}
            </div>
            <div className="flex items-center justify-between mb-2">
                <button
                    type="button"
                    onClick={() => goToMonth(-1)}
                    aria-label="Previous month"
                    className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                >
                    <ChevronLeftIcon className="w-4 h-4" />
                </button>
                <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">{monthLabel}</div>
                <button
                    type="button"
                    onClick={() => goToMonth(1)}
                    aria-label="Next month"
                    className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                >
                    <ChevronRightIcon className="w-4 h-4" />
                </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-400 dark:text-gray-500 mb-1">
                {WEEKDAY_LABELS.map((label, idx) => (
                    <div key={idx}>{label}</div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {cells.map((day, idx) => {
                    if (day === null) {
                        return <div key={`blank-${idx}`} />;
                    }
                    const iso = isoFromParts(year, month + 1, day);
                    const hasExercise = exerciseDates ? exerciseDates.has(iso) : false;
                    const isSelected = iso === selectedDate;
                    const isToday = iso === today;
                    return (
                        <button
                            key={iso}
                            type="button"
                            onClick={() => onSelectDate(iso)}
                            className={`relative flex flex-col items-center justify-center h-8 rounded-lg text-xs transition-colors
                                ${isSelected ? 'bg-indigo-500 text-white font-semibold' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'}
                                ${!isSelected && isToday ? 'ring-1 ring-indigo-300 dark:ring-indigo-700' : ''}`}
                        >
                            {day}
                            {hasExercise && (
                                <span className={`absolute bottom-0.5 w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-indigo-500'}`} />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
