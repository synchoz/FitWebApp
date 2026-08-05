import React, { useEffect, useMemo, useState } from 'react';
import dashboardService from '../../../../API/Services/dashboard.service';
import getErrorMessage from '../../../../API/getErrorMessage';
import { todayIso } from '../../../../utils/date';
import { PlusIcon, PencilIcon, TrashIcon, CheckIcon, XMarkIcon, DocumentDuplicateIcon, ClipboardDocumentIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';
import Select from '../../../../components/ui/Select';
import DatePicker from '../../../../components/ui/DatePicker';

const NEW_EXERCISE_OPTION = '__new__';
const EXERCISE_CATEGORIES = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio', 'Custom'];

// Same compact shorthand the WhatsApp importer parses, e.g. "Bench press 30kg 11,13,12"
// or "Dips 30kg 5 35kg 5" when the weight changes mid-exercise - so a day copied out here
// pastes as a normal message and, once copied back out of WhatsApp later, re-imports cleanly.
function formatExerciseLineForExport(exercise, sets) {
    const groups = [];
    sets.forEach(({ reps, weight }) => {
        const lastGroup = groups[groups.length - 1];
        if (lastGroup && lastGroup.weight === weight) {
            lastGroup.reps.push(reps);
        } else {
            groups.push({ weight, reps: [reps] });
        }
    });

    const parts = groups.map((group) => {
        const repsStr = group.reps.join(',');
        if (groups.length === 1 && (group.weight === null || group.weight === undefined)) {
            return repsStr;
        }
        const weightStr = group.weight === null || group.weight === undefined ? 'b' : `${group.weight}kg`;
        return `${weightStr} ${repsStr}`;
    });

    return `${exercise} ${parts.join(' ')}`;
}

function buildExerciseExportText(sortedRows) {
    const lines = [];
    let currentExercise = null;
    let currentSets = [];

    const flush = () => {
        if (currentExercise && currentSets.length > 0) {
            lines.push(formatExerciseLineForExport(currentExercise, currentSets));
        }
    };

    sortedRows.forEach((row) => {
        if (row.exercise !== currentExercise) {
            flush();
            currentExercise = row.exercise;
            currentSets = [];
        }
        currentSets.push({ reps: row.reps, weight: row.weight });
    });
    flush();

    return lines.join('\n');
}

function addDays(isoDate, days) {
    const d = new Date(`${isoDate}T00:00:00`);
    d.setDate(d.getDate() + days);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function groupByCategory(catalog) {
    return catalog.reduce((groups, item) => {
        const category = item.category || 'Other';
        groups[category] = groups[category] || [];
        groups[category].push(item);
        return groups;
    }, {});
}

async function fetchCatalog() {
    return await dashboardService.getExercisesList();
}

async function fetchUserExercises(date) {
    return await dashboardService.getUserExerciseList(date);
}

const ExerciseLogTable = ({ date }) => {
    const [tableData, setTableData] = useState([]);
    const [catalog, setCatalog] = useState([]);
    const [newExercise, setNewExercise] = useState('');
    const [newReps, setNewReps] = useState('');
    const [newWeight, setNewWeight] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editReps, setEditReps] = useState('');
    const [editWeight, setEditWeight] = useState('');
    const [copyFromDate, setCopyFromDate] = useState(addDays(date, -1));
    const [error, setError] = useState('');
    const [exportCopied, setExportCopied] = useState(false);
    const [showNewExerciseForm, setShowNewExerciseForm] = useState(false);
    const [newExerciseName, setNewExerciseName] = useState('');
    const [newExerciseCategory, setNewExerciseCategory] = useState(EXERCISE_CATEGORIES[0]);

    useEffect(() => {
        let cancelled = false;
        setError('');
        fetchUserExercises(date).then(result => {
            if (cancelled) return;
            const list = result.result.map((row) => ({
                id: row.id,
                setnumber: row.setnumber,
                reps: row.reps,
                weight: row.weight,
                exercise: row.exercise ? row.exercise.exercise : null,
                category: row.exercise ? row.exercise.category : null,
            }));
            setTableData(list);
        }).catch(() => { if (!cancelled) setError('Could not load your exercise log'); });
        fetchCatalog().then(result => {
            if (cancelled) return;
            setCatalog(result.result);
        }).catch(() => { if (!cancelled) setError('Could not load the exercise catalog'); });
        setCopyFromDate(addDays(date, -1));
        return () => { cancelled = true; };
    }, [date]);

    const handleExerciseSelect = (exercise) => {
        if (exercise === NEW_EXERCISE_OPTION) {
            setShowNewExerciseForm(true);
            setNewExercise('');
            return;
        }
        setNewExercise(exercise);
        const previousSets = tableData.filter((row) => row.exercise === exercise);
        if (previousSets.length > 0) {
            const lastSet = previousSets.reduce((latest, row) => (row.setnumber > latest.setnumber ? row : latest));
            setNewReps(lastSet.reps);
            setNewWeight(lastSet.weight === null || lastSet.weight === undefined ? '' : lastSet.weight);
        } else {
            setNewReps('');
            setNewWeight('');
        }
    };

    const handleAddSet = async (e) => {
        e.preventDefault();
        const reps = Number(newReps);
        if (!newExercise || !reps || reps <= 0) {
            setError('Select an exercise and enter valid reps');
            return;
        }
        setError('');

        const weight = newWeight === '' ? null : Number(newWeight);
        const added = await dashboardService.addUserExercise(newExercise, reps, weight, date);
        const category = catalog.find((row) => row.exercise === newExercise)?.category || null;

        const newRow = {
            id: added.result.id,
            setnumber: added.result.setnumber,
            reps: added.result.reps,
            weight: added.result.weight,
            exercise: newExercise,
            category,
        };
        setTableData([...tableData, newRow]);
    };

    const cancelNewExercise = () => {
        setShowNewExerciseForm(false);
        setNewExerciseName('');
        setNewExerciseCategory(EXERCISE_CATEGORIES[0]);
    };

    const handleCreateExercise = async (e) => {
        e.preventDefault();
        if (!newExerciseName.trim()) {
            setError('Enter an exercise name');
            return;
        }
        setError('');
        try {
            const created = await dashboardService.addExercise(newExerciseName.trim(), newExerciseCategory);
            setCatalog([...catalog, created.result]);
            handleExerciseSelect(created.result.exercise);
            cancelNewExercise();
        } catch (err) {
            setError(getErrorMessage(err));
        }
    };

    const startEdit = (row) => {
        setEditingId(row.id);
        setEditReps(row.reps);
        setEditWeight(row.weight === null || row.weight === undefined ? '' : row.weight);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditReps('');
        setEditWeight('');
    };

    const saveEdit = async (row) => {
        const reps = Number(editReps);
        if (!reps || reps <= 0) {
            return;
        }
        const weight = editWeight === '' ? null : Number(editWeight);

        await dashboardService.updateUserExercise(row.id, reps, weight);

        const updated = tableData.map((r) => (r.id === row.id ? { ...r, reps, weight } : r));
        setTableData(updated);
        cancelEdit();
    };

    const handleDelete = async (row) => {
        await dashboardService.deleteUserExercise(row.id);
        setTableData(tableData.filter((r) => r.id !== row.id));
    };

    const handleDuplicate = async (row) => {
        const added = await dashboardService.addUserExercise(row.exercise, row.reps, row.weight, date);

        const newRow = {
            id: added.result.id,
            setnumber: added.result.setnumber,
            reps: added.result.reps,
            weight: added.result.weight,
            exercise: row.exercise,
            category: row.category,
        };
        setTableData([...tableData, newRow]);
    };

    const handleCopy = async () => {
        setError('');
        try {
            const copied = await dashboardService.copyExerciseLog(copyFromDate, date);
            const list = copied.result.map((row) => ({
                id: row.id,
                setnumber: row.setnumber,
                reps: row.reps,
                weight: row.weight,
                exercise: row.exercise ? row.exercise.exercise : null,
                category: row.exercise ? row.exercise.category : null,
            }));
            setTableData([...tableData, ...list]);
        } catch (err) {
            setError(getErrorMessage(err));
        }
    };

    const groupedCatalog = groupByCategory(catalog);
    const sortedRows = [...tableData].sort((a, b) => {
        if (a.exercise !== b.exercise) {
            return (a.exercise || '').localeCompare(b.exercise || '');
        }
        return a.setnumber - b.setnumber;
    });

    const exerciseGroups = useMemo(() => {
        const groups = [];
        sortedRows.forEach((row) => {
            const last = groups[groups.length - 1];
            if (last && last.exercise === row.exercise) {
                last.rows.push(row);
            } else {
                groups.push({ exercise: row.exercise, category: row.category, rows: [row] });
            }
        });
        return groups;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tableData]);

    const handleExportCopy = async () => {
        setError('');
        try {
            await navigator.clipboard.writeText(buildExerciseExportText(sortedRows));
            setExportCopied(true);
            setTimeout(() => setExportCopied(false), 2000);
        } catch (err) {
            setError('Could not copy to clipboard');
        }
    };

    return (
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-5'>
            <div className='flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between mb-4'>
                <form onSubmit={handleAddSet} className='flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end'>
                    <div className='flex flex-col'>
                        <label className='text-xs font-medium text-gray-500 mb-1'>Exercise</label>
                        <Select
                            value={newExercise}
                            onChange={handleExerciseSelect}
                            placeholder='Select exercise...'
                            className='sm:min-w-[180px]'
                        >
                            <Select.Option value={NEW_EXERCISE_OPTION} label='+ Add new exercise...' special />
                            <Select.Divider />
                            {Object.keys(groupedCatalog).map((category) => (
                                <Select.Group key={category} label={category}>
                                    {groupedCatalog[category].map((item) => (
                                        <Select.Option key={item.exercise} value={item.exercise} label={item.exercise} />
                                    ))}
                                </Select.Group>
                            ))}
                        </Select>
                    </div>
                    <div className='grid grid-cols-2 gap-3 sm:flex sm:gap-3'>
                        <div className='flex flex-col'>
                            <label className='text-xs font-medium text-gray-500 mb-1'>Reps</label>
                            <input
                                type='number'
                                value={newReps}
                                onChange={(e) => setNewReps(e.target.value)}
                                className='border border-gray-300 rounded-xl px-3 py-2.5 sm:py-1.5 text-base sm:text-sm w-full sm:w-20 transition-colors focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
                                placeholder='e.g. 8'
                            />
                        </div>
                        <div className='flex flex-col'>
                            <label className='text-xs font-medium text-gray-500 mb-1'>Weight (kg)</label>
                            <input
                                type='number'
                                value={newWeight}
                                onChange={(e) => setNewWeight(e.target.value)}
                                className='border border-gray-300 rounded-xl px-3 py-2.5 sm:py-1.5 text-base sm:text-sm w-full sm:w-24 transition-colors focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
                                placeholder='bodyweight'
                            />
                        </div>
                    </div>
                    <button
                        type='submit'
                        className='flex items-center justify-center gap-1 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold px-3 py-2.5 sm:py-1.5 rounded-md w-full sm:w-auto'
                    >
                        <PlusIcon className='w-4 h-4' /> Add Set
                    </button>
                </form>

                <div className='flex flex-col gap-2 sm:flex-row sm:items-end'>
                    <div className='flex flex-col'>
                        <label className='text-xs font-medium text-gray-500 mb-1'>Copy from</label>
                        <DatePicker value={copyFromDate} onChange={setCopyFromDate} />
                    </div>
                    <div className='grid grid-cols-2 gap-2 sm:flex sm:gap-2'>
                        <button
                            type='button'
                            onClick={handleCopy}
                            className='bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-semibold px-3 py-2.5 sm:py-1.5 rounded-md'
                        >
                            Copy Session
                        </button>
                        <button
                            type='button'
                            onClick={handleExportCopy}
                            disabled={sortedRows.length === 0}
                            title='Copy this day as text to paste into WhatsApp'
                            className='flex items-center justify-center gap-1 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 text-gray-700 text-sm font-semibold px-3 py-2.5 sm:py-1.5 rounded-md'
                        >
                            {exportCopied
                                ? <><ClipboardDocumentCheckIcon className='w-4 h-4' /> Copied!</>
                                : <><ClipboardDocumentIcon className='w-4 h-4' /> Copy to WhatsApp</>}
                        </button>
                    </div>
                </div>
            </div>
            {showNewExerciseForm && (
                <form onSubmit={handleCreateExercise} className='grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-end mb-4 bg-gray-50 border border-gray-200 rounded-xl p-3'>
                    <div className='col-span-2 sm:col-auto flex flex-col'>
                        <label className='text-xs font-medium text-gray-500 mb-1'>Exercise name</label>
                        <input
                            type='text'
                            value={newExerciseName}
                            onChange={(e) => setNewExerciseName(e.target.value)}
                            className='border border-gray-300 rounded-xl px-3 py-2.5 sm:py-1.5 text-base sm:text-sm w-full sm:min-w-[180px] transition-colors focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
                            placeholder='e.g. Cable Fly'
                            autoFocus
                        />
                    </div>
                    <div className='col-span-2 sm:col-auto flex flex-col'>
                        <label className='text-xs font-medium text-gray-500 mb-1'>Category</label>
                        <Select value={newExerciseCategory} onChange={setNewExerciseCategory}>
                            {EXERCISE_CATEGORIES.map((category) => (
                                <Select.Option key={category} value={category} label={category} />
                            ))}
                        </Select>
                    </div>
                    <button
                        type='submit'
                        className='col-span-2 sm:col-auto flex items-center justify-center gap-1 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold px-3 py-2.5 sm:py-1.5 rounded-md w-full sm:w-auto'
                    >
                        <CheckIcon className='w-4 h-4' /> Save exercise
                    </button>
                    <button
                        type='button'
                        onClick={cancelNewExercise}
                        className='col-span-2 sm:col-auto flex items-center justify-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold px-3 py-2.5 sm:py-1.5 rounded-md w-full sm:w-auto'
                    >
                        <XMarkIcon className='w-4 h-4' /> Cancel
                    </button>
                </form>
            )}
            {error && <div className='text-red-600 text-sm mb-3'>{error}</div>}
            <div className='sm:hidden flex flex-col gap-3'>
                {exerciseGroups.map((group) => (
                    <div key={group.exercise} className='border border-gray-100 rounded-xl overflow-hidden'>
                        <div className='px-3 py-2 bg-gray-50 border-b border-gray-100 flex items-baseline gap-2'>
                            <div className='font-medium text-gray-800'>{group.exercise}</div>
                            {group.category && <div className='text-xs text-gray-400'>{group.category}</div>}
                        </div>
                        <div className='divide-y divide-gray-100'>
                            {group.rows.map((row) => (
                                <div key={row.id} className='p-3'>
                                    <div className='flex items-start justify-between gap-2'>
                                        <div className='text-xs text-gray-500'>Set {row.setnumber}</div>
                                        <div className='flex items-center gap-1 -mr-2 -mt-1'>
                                            {editingId === row.id ? (
                                                <>
                                                    <button onClick={() => saveEdit(row)} className='p-2 text-green-600 active:text-green-700'>
                                                        <CheckIcon className='w-5 h-5' />
                                                    </button>
                                                    <button onClick={cancelEdit} className='p-2 text-gray-400 active:text-gray-600'>
                                                        <XMarkIcon className='w-5 h-5' />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button onClick={() => handleDuplicate(row)} title='Duplicate set' className='p-2 text-gray-400 active:text-indigo-600'>
                                                        <DocumentDuplicateIcon className='w-5 h-5' />
                                                    </button>
                                                    <button onClick={() => startEdit(row)} title='Edit set' className='p-2 text-gray-400 active:text-indigo-600'>
                                                        <PencilIcon className='w-5 h-5' />
                                                    </button>
                                                    <button onClick={() => handleDelete(row)} title='Delete set' className='p-2 text-gray-400 active:text-red-600'>
                                                        <TrashIcon className='w-5 h-5' />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    {editingId === row.id ? (
                                        <div className='mt-2 flex items-center gap-3 text-sm text-gray-600'>
                                            <div className='flex items-center gap-1'>
                                                Reps:
                                                <input
                                                    type='number'
                                                    value={editReps}
                                                    onChange={(e) => setEditReps(e.target.value)}
                                                    className='border border-gray-300 rounded-lg px-2 py-1 w-16 text-sm transition-colors focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
                                                    autoFocus
                                                />
                                            </div>
                                            <div className='flex items-center gap-1'>
                                                Weight:
                                                <input
                                                    type='number'
                                                    value={editWeight}
                                                    onChange={(e) => setEditWeight(e.target.value)}
                                                    className='border border-gray-300 rounded-lg px-2 py-1 w-20 text-sm transition-colors focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
                                                    placeholder='bodyweight'
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className='mt-1 flex items-center gap-4 text-sm text-gray-600'>
                                            <span><span className='font-semibold text-gray-800'>{row.reps}</span> reps</span>
                                            <span className='font-semibold text-gray-800'>
                                                {row.weight === null || row.weight === undefined ? 'bodyweight' : `${row.weight}kg`}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
                {sortedRows.length === 0 && (
                    <div className='py-6 text-center text-gray-400 text-sm'>
                        {date === todayIso() ? 'No exercises logged yet today.' : 'No exercises logged for this day.'}
                    </div>
                )}
            </div>
            <div className='hidden sm:block overflow-x-auto'>
            <table className='w-full text-sm whitespace-nowrap'>
                <thead>
                    <tr className='text-left text-gray-500 border-b border-gray-200'>
                        <th className='py-2 font-medium w-16'>Set</th>
                        <th className='py-2 font-medium'>Reps</th>
                        <th className='py-2 font-medium'>Weight</th>
                        <th className='py-2 font-medium text-right'>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {exerciseGroups.map((group) => (
                        <React.Fragment key={group.exercise}>
                            <tr className='bg-gray-50'>
                                <td colSpan={4} className='py-1.5 px-2 text-xs font-semibold uppercase tracking-wide text-gray-500'>
                                    {group.exercise}
                                    {group.category && <span className='ml-2 font-normal normal-case text-gray-400'>· {group.category}</span>}
                                </td>
                            </tr>
                            {group.rows.map((row) => (
                                <tr key={row.id} className='border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors'>
                                    <td className='py-2 pl-2 text-gray-400'>{row.setnumber}</td>
                                    <td className='py-2'>
                                        {editingId === row.id
                                            ? <input
                                                type='number'
                                                value={editReps}
                                                onChange={(e) => setEditReps(e.target.value)}
                                                className='border border-gray-300 rounded-lg px-2 py-0.5 w-16 text-sm transition-colors focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
                                                autoFocus
                                            />
                                            : row.reps}
                                    </td>
                                    <td className='py-2'>
                                        {editingId === row.id
                                            ? <input
                                                type='number'
                                                value={editWeight}
                                                onChange={(e) => setEditWeight(e.target.value)}
                                                className='border border-gray-300 rounded-lg px-2 py-0.5 w-20 text-sm transition-colors focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
                                                placeholder='bodyweight'
                                            />
                                            : (row.weight === null || row.weight === undefined ? 'bodyweight' : `${row.weight}kg`)}
                                    </td>
                                    <td className='py-2'>
                                        <div className='flex items-center justify-end gap-2'>
                                            {editingId === row.id ? (
                                                <>
                                                    <button onClick={() => saveEdit(row)} className='text-green-600 hover:text-green-700'>
                                                        <CheckIcon className='w-4 h-4' />
                                                    </button>
                                                    <button onClick={cancelEdit} className='text-gray-400 hover:text-gray-600'>
                                                        <XMarkIcon className='w-4 h-4' />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button onClick={() => handleDuplicate(row)} title='Duplicate set' className='text-gray-400 hover:text-indigo-600'>
                                                        <DocumentDuplicateIcon className='w-4 h-4' />
                                                    </button>
                                                    <button onClick={() => startEdit(row)} title='Edit set' className='text-gray-400 hover:text-indigo-600'>
                                                        <PencilIcon className='w-4 h-4' />
                                                    </button>
                                                    <button onClick={() => handleDelete(row)} title='Delete set' className='text-gray-400 hover:text-red-600'>
                                                        <TrashIcon className='w-4 h-4' />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </React.Fragment>
                    ))}
                    {sortedRows.length === 0 && (
                        <tr>
                            <td colSpan={4} className='py-6 text-center text-gray-400'>
                                {date === todayIso() ? 'No exercises logged yet today.' : 'No exercises logged for this day.'}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
            </div>
        </div>
    );
};

export default ExerciseLogTable;
