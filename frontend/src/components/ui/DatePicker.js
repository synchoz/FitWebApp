import React, { useState, useEffect, Fragment } from 'react';
import { Popover, Transition } from '@headlessui/react';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { todayIso } from '../../utils/date';

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function pad(n) {
    return String(n).padStart(2, '0');
}

function isoFromParts(year, month, day) {
    return `${year}-${pad(month)}-${pad(day)}`;
}

function parseIso(iso) {
    if (!iso) return null;
    const [y, m, d] = iso.split('-').map(Number);
    if (!y || !m || !d) return null;
    return { y, m, d };
}

function formatDisplay(iso) {
    const parsed = parseIso(iso);
    if (!parsed) return '';
    return new Date(parsed.y, parsed.m - 1, parsed.d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function DatePicker({ value, onChange, placeholder = 'Select date', className = '' }) {
    const initial = parseIso(value) || parseIso(todayIso());
    const [visibleMonth, setVisibleMonth] = useState(new Date(initial.y, initial.m - 1, 1));

    useEffect(() => {
        const parsed = parseIso(value);
        if (!parsed) return;
        setVisibleMonth((current) => (
            current.getFullYear() === parsed.y && current.getMonth() === parsed.m - 1
                ? current
                : new Date(parsed.y, parsed.m - 1, 1)
        ));
    }, [value]);

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

    const today = todayIso();

    return (
        <Popover className={`relative ${className}`}>
            <Popover.Button
                className="flex items-center justify-between gap-2 border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2.5 sm:py-1.5 text-base sm:text-sm w-full text-left bg-white dark:bg-gray-800 transition-colors focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900"
            >
                <span className={value ? 'text-gray-700 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500'}>
                    {value ? formatDisplay(value) : placeholder}
                </span>
                <CalendarIcon className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
            </Popover.Button>
            <Transition
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
            >
                <Popover.Panel className="fixed inset-x-4 top-1/2 z-30 w-auto -translate-y-1/2 rounded-xl bg-white dark:bg-gray-800 p-3 shadow-lg border border-gray-100 dark:border-gray-700 sm:absolute sm:inset-x-auto sm:top-auto sm:z-20 sm:mt-1 sm:w-64 sm:translate-y-0">
                    {({ close }) => (
                        <>
                            <div className="flex items-center justify-between mb-2">
                                <button
                                    type="button"
                                    onClick={() => setVisibleMonth(new Date(year, month - 1, 1))}
                                    aria-label="Previous month"
                                    className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                                >
                                    <ChevronLeftIcon className="w-4 h-4" />
                                </button>
                                <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">{monthLabel}</div>
                                <button
                                    type="button"
                                    onClick={() => setVisibleMonth(new Date(year, month + 1, 1))}
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
                                    const isSelected = iso === value;
                                    const isToday = iso === today;
                                    return (
                                        <button
                                            key={iso}
                                            type="button"
                                            onClick={() => { onChange(iso); close(); }}
                                            className={`flex items-center justify-center h-8 rounded-lg text-xs transition-colors
                                                ${isSelected ? 'bg-indigo-500 text-white font-semibold' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'}
                                                ${!isSelected && isToday ? 'ring-1 ring-indigo-300 dark:ring-indigo-700' : ''}`}
                                        >
                                            {day}
                                        </button>
                                    );
                                })}
                            </div>
                            <button
                                type="button"
                                onClick={() => { onChange(today); close(); }}
                                className="mt-2 w-full text-center text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 py-1"
                            >
                                Today
                            </button>
                        </>
                    )}
                </Popover.Panel>
            </Transition>
        </Popover>
    );
}
