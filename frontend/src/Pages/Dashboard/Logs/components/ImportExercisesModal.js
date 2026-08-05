import React, { useState } from 'react';
import dashboardService from '../../../../API/Services/dashboard.service';
import getErrorMessage from '../../../../API/getErrorMessage';
import { ArrowUpTrayIcon, XMarkIcon, TrashIcon } from '@heroicons/react/24/outline';
import Select from '../../../../components/ui/Select';
import DatePicker from '../../../../components/ui/DatePicker';

const CUSTOM_NAME_OPTION = '__custom__';

let nextRowId = 0;

function groupByCategory(catalog) {
    return catalog.reduce((groups, item) => {
        const category = item.category || 'Other';
        groups[category] = groups[category] || [];
        groups[category].push(item);
        return groups;
    }, {});
}

function toPreviewRow(parsed) {
    nextRowId += 1;
    return {
        id: nextRowId,
        date: parsed.date,
        exercise: parsed.matchedExercise || parsed.exerciseRaw,
        matched: Boolean(parsed.matchedExercise),
        customEntry: false,
        weight: parsed.weight === null || parsed.weight === undefined ? '' : parsed.weight,
        reps: parsed.reps,
        sourceLine: parsed.sourceLine,
    };
}

const ImportExercisesModal = ({ onImported }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [catalog, setCatalog] = useState([]);
    const [rawText, setRawText] = useState('');
    const [rows, setRows] = useState([]);
    const [parsing, setParsing] = useState(false);
    const [importing, setImporting] = useState(false);
    const [error, setError] = useState('');
    const [status, setStatus] = useState('');

    const openModal = async () => {
        setIsOpen(true);
        setError('');
        try {
            const result = await dashboardService.getExercisesList();
            setCatalog(result.result);
        } catch (err) {
            setError(getErrorMessage(err));
        }
    };

    const closeModal = () => {
        setIsOpen(false);
        setRawText('');
        setRows([]);
        setError('');
        setStatus('');
    };

    const handleParse = async () => {
        if (!rawText.trim()) {
            setError('Paste some text first');
            return;
        }
        setParsing(true);
        setError('');
        setStatus('');
        try {
            const result = await dashboardService.parseWhatsappExercises(rawText);
            setRows(result.result.map(toPreviewRow));
            setStatus(result.result.length === 0 ? 'Could not find any sets in that text.' : '');
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setParsing(false);
        }
    };

    const updateRow = (id, updates) => {
        setRows((current) => current.map((row) => (row.id === id ? { ...row, ...updates } : row)));
    };

    const removeRow = (id) => {
        setRows((current) => current.filter((row) => row.id !== id));
    };

    const handleExerciseSelect = (row, value) => {
        if (value === CUSTOM_NAME_OPTION) {
            updateRow(row.id, { customEntry: true, exercise: '', matched: false });
            return;
        }
        const isKnown = catalog.some((item) => item.exercise === value);
        updateRow(row.id, { exercise: value, matched: isKnown });
    };

    const handleImport = async () => {
        setImporting(true);
        setError('');
        setStatus('');

        const catalogNames = new Set(catalog.map((item) => item.exercise.toLowerCase()));
        const newNames = [...new Set(
            rows
                .map((row) => row.exercise.trim())
                .filter((name) => name && !catalogNames.has(name.toLowerCase())),
        )];

        try {
            for (const name of newNames) {
                const created = await dashboardService.addExercise(name, 'Custom');
                catalogNames.add(created.result.exercise.toLowerCase());
                setCatalog((current) => [...current, created.result]);
            }

            const failedRows = [];
            let importedCount = 0;
            for (const row of rows) {
                const exercise = row.exercise.trim();
                const reps = Number(row.reps);
                const validRow = exercise && Number.isInteger(reps) && reps > 0 && row.date;
                if (!validRow) {
                    failedRows.push(row);
                    continue;
                }
                const weight = row.weight === '' ? null : Number(row.weight);
                try {
                    await dashboardService.addUserExercise(exercise, reps, weight, row.date);
                    importedCount += 1;
                } catch (err) {
                    failedRows.push(row);
                }
            }

            setRows(failedRows);
            if (failedRows.length === 0) {
                if (onImported) {
                    onImported();
                }
                closeModal();
            } else {
                setError(`Imported ${importedCount} of ${rows.length} sets. Fix the remaining rows below and import again.`);
            }
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setImporting(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                type='button'
                onClick={openModal}
                className='flex items-center gap-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-semibold px-3 py-1.5 rounded-md'
            >
                <ArrowUpTrayIcon className='w-4 h-4' /> Import from WhatsApp
            </button>
        );
    }

    const groupedCatalog = groupByCategory(catalog);

    return (
        <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50 sm:p-4'>
            <div className='bg-white shadow-lg w-full h-full sm:h-auto sm:max-w-4xl sm:max-h-[85vh] rounded-none sm:rounded-xl flex flex-col'>
                <div className='flex items-center justify-between px-5 py-4 border-b border-gray-100'>
                    <div className='text-lg font-semibold text-gray-800'>Import exercises from WhatsApp</div>
                    <button type='button' onClick={closeModal} className='p-2 -mr-2 text-gray-400 active:text-gray-600'>
                        <XMarkIcon className='w-5 h-5' />
                    </button>
                </div>

                <div className='px-5 py-4 overflow-y-auto'>
                    <p className='text-sm text-gray-500 mb-3'>
                        Paste your workout messages below (a WhatsApp chat export works, or just the messages themselves).
                        Parsing is best-effort - review and fix the table before importing.
                    </p>
                    <textarea
                        value={rawText}
                        onChange={(e) => setRawText(e.target.value)}
                        rows={6}
                        placeholder={'[21:18, 24/06/2026] you: Bench press 30kg 11,13,12\nPullups 8,8,8\n...'}
                        className='w-full border border-gray-300 rounded-xl px-3 py-2 text-sm font-mono transition-colors focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
                    />
                    <div className='flex items-center gap-3 mt-3'>
                        <button
                            type='button'
                            onClick={handleParse}
                            disabled={parsing}
                            className='bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-sm font-semibold px-3 py-1.5 rounded-md'
                        >
                            {parsing ? 'Parsing...' : 'Parse'}
                        </button>
                        {rows.length > 0 && (
                            <span className='text-sm text-gray-500'>{rows.length} sets found</span>
                        )}
                    </div>

                    {error && <div className='text-red-600 text-sm mt-3'>{error}</div>}
                    {status && !error && <div className='text-gray-500 text-sm mt-3'>{status}</div>}

                    {rows.length > 0 && (
                        <div className='sm:hidden flex flex-col gap-3 mt-4'>
                            {rows.map((row) => (
                                <div key={row.id} className='border border-gray-200 rounded-xl p-3'>
                                    <div className='flex items-start justify-between gap-2'>
                                        <div className='flex-1'>
                                            {row.customEntry ? (
                                                <div className='flex items-center gap-1'>
                                                    <input
                                                        type='text'
                                                        autoFocus
                                                        value={row.exercise}
                                                        onChange={(e) => updateRow(row.id, { exercise: e.target.value, matched: false })}
                                                        placeholder='New exercise name'
                                                        className='border border-amber-400 bg-amber-50 rounded-lg px-2 py-2 text-base w-full transition-colors focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
                                                    />
                                                    <button
                                                        type='button'
                                                        onClick={() => updateRow(row.id, { customEntry: false })}
                                                        title='Back to dropdown'
                                                        className='p-2 text-gray-400 active:text-indigo-600'
                                                    >
                                                        <XMarkIcon className='w-5 h-5' />
                                                    </button>
                                                </div>
                                            ) : (
                                                <Select
                                                    value={row.exercise}
                                                    onChange={(value) => handleExerciseSelect(row, value)}
                                                    warning={!row.matched}
                                                    displayLabel={!row.matched && row.exercise ? `${row.exercise} (new)` : undefined}
                                                    placeholder='Select exercise...'
                                                >
                                                    {!row.matched && row.exercise && (
                                                        <Select.Option value={row.exercise} label={`${row.exercise} (new)`} />
                                                    )}
                                                    <Select.Option value={CUSTOM_NAME_OPTION} label='+ Type a different name...' special />
                                                    <Select.Divider />
                                                    {Object.keys(groupedCatalog).map((category) => (
                                                        <Select.Group key={category} label={category}>
                                                            {groupedCatalog[category].map((item) => (
                                                                <Select.Option key={item.exercise} value={item.exercise} label={item.exercise} />
                                                            ))}
                                                        </Select.Group>
                                                    ))}
                                                </Select>
                                            )}
                                        </div>
                                        <button onClick={() => removeRow(row.id)} title='Remove row' className='p-2 -mr-2 text-gray-400 active:text-red-600'>
                                            <TrashIcon className='w-5 h-5' />
                                        </button>
                                    </div>
                                    <div className='mt-2 grid grid-cols-3 gap-2'>
                                        <div className='flex flex-col'>
                                            <label className='text-xs font-medium text-gray-500 mb-1'>Date</label>
                                            <DatePicker value={row.date} onChange={(iso) => updateRow(row.id, { date: iso })} />
                                        </div>
                                        <div className='flex flex-col'>
                                            <label className='text-xs font-medium text-gray-500 mb-1'>Weight</label>
                                            <input
                                                type='number'
                                                value={row.weight}
                                                onChange={(e) => updateRow(row.id, { weight: e.target.value })}
                                                placeholder='bodyweight'
                                                className='border border-gray-300 rounded-lg px-2 py-1.5 text-sm w-full transition-colors focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
                                            />
                                        </div>
                                        <div className='flex flex-col'>
                                            <label className='text-xs font-medium text-gray-500 mb-1'>Reps</label>
                                            <input
                                                type='number'
                                                value={row.reps}
                                                onChange={(e) => updateRow(row.id, { reps: e.target.value })}
                                                className='border border-gray-300 rounded-lg px-2 py-1.5 text-sm w-full transition-colors focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
                                            />
                                        </div>
                                    </div>
                                    <div className='mt-2 text-xs text-gray-400 truncate' title={row.sourceLine}>{row.sourceLine}</div>
                                </div>
                            ))}
                        </div>
                    )}
                    {rows.length > 0 && (
                        <div className='hidden sm:block mt-4 overflow-x-auto'>
                            <table className='w-full text-sm whitespace-nowrap'>
                                <thead>
                                    <tr className='text-left text-gray-500 border-b border-gray-200'>
                                        <th className='py-2 font-medium'>Date</th>
                                        <th className='py-2 font-medium'>Exercise</th>
                                        <th className='py-2 font-medium'>Weight</th>
                                        <th className='py-2 font-medium'>Reps</th>
                                        <th className='py-2 font-medium'>Source</th>
                                        <th className='py-2 font-medium text-right'>Remove</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((row) => (
                                        <tr key={row.id} className='border-b border-gray-100 last:border-0'>
                                            <td className='py-1.5 pr-2'>
                                                <DatePicker value={row.date} onChange={(iso) => updateRow(row.id, { date: iso })} className='w-40' />
                                            </td>
                                            <td className='py-1.5 pr-2'>
                                                {row.customEntry ? (
                                                    <div className='flex items-center gap-1'>
                                                        <input
                                                            type='text'
                                                            autoFocus
                                                            value={row.exercise}
                                                            onChange={(e) => updateRow(row.id, { exercise: e.target.value, matched: false })}
                                                            placeholder='New exercise name'
                                                            className='border border-amber-400 bg-amber-50 rounded-lg px-2 py-1 text-sm w-36 transition-colors focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
                                                        />
                                                        <button
                                                            type='button'
                                                            onClick={() => updateRow(row.id, { customEntry: false })}
                                                            title='Back to dropdown'
                                                            className='text-gray-400 hover:text-indigo-600'
                                                        >
                                                            <XMarkIcon className='w-4 h-4' />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <Select
                                                        value={row.exercise}
                                                        onChange={(value) => handleExerciseSelect(row, value)}
                                                        warning={!row.matched}
                                                        displayLabel={!row.matched && row.exercise ? `${row.exercise} (new)` : undefined}
                                                        placeholder='Select exercise...'
                                                        className='w-44'
                                                    >
                                                        {!row.matched && row.exercise && (
                                                            <Select.Option value={row.exercise} label={`${row.exercise} (new)`} />
                                                        )}
                                                        <Select.Option value={CUSTOM_NAME_OPTION} label='+ Type a different name...' special />
                                                        <Select.Divider />
                                                        {Object.keys(groupedCatalog).map((category) => (
                                                            <Select.Group key={category} label={category}>
                                                                {groupedCatalog[category].map((item) => (
                                                                    <Select.Option key={item.exercise} value={item.exercise} label={item.exercise} />
                                                                ))}
                                                            </Select.Group>
                                                        ))}
                                                    </Select>
                                                )}
                                            </td>
                                            <td className='py-1.5 pr-2'>
                                                <input
                                                    type='number'
                                                    value={row.weight}
                                                    onChange={(e) => updateRow(row.id, { weight: e.target.value })}
                                                    placeholder='bodyweight'
                                                    className='border border-gray-300 rounded-lg px-2 py-1 text-sm w-20 transition-colors focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
                                                />
                                            </td>
                                            <td className='py-1.5 pr-2'>
                                                <input
                                                    type='number'
                                                    value={row.reps}
                                                    onChange={(e) => updateRow(row.id, { reps: e.target.value })}
                                                    className='border border-gray-300 rounded-lg px-2 py-1 text-sm w-16 transition-colors focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
                                                />
                                            </td>
                                            <td className='py-1.5 pr-2 text-gray-400 text-xs max-w-[220px] truncate' title={row.sourceLine}>
                                                {row.sourceLine}
                                            </td>
                                            <td className='py-1.5 text-right'>
                                                <button onClick={() => removeRow(row.id)} title='Remove row' className='text-gray-400 hover:text-red-600'>
                                                    <TrashIcon className='w-4 h-4' />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className='flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end px-5 py-4 border-t border-gray-100'>
                    <button
                        type='button'
                        onClick={closeModal}
                        className='bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold px-3 py-2.5 sm:py-1.5 rounded-md w-full sm:w-auto'
                    >
                        Cancel
                    </button>
                    <button
                        type='button'
                        onClick={handleImport}
                        disabled={rows.length === 0 || importing}
                        className='bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-sm font-semibold px-3 py-2.5 sm:py-1.5 rounded-md w-full sm:w-auto'
                    >
                        {importing ? 'Importing...' : `Import ${rows.length} set${rows.length === 1 ? '' : 's'}`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImportExercisesModal;
