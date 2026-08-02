import React, { useEffect, useState } from 'react';
import dashboardService from '../../../../API/Services/dashboard.service';
import getErrorMessage from '../../../../API/getErrorMessage';
import { todayIso } from '../../../../utils/date';
import { PlusIcon, PencilIcon, TrashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

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

    useEffect(() => {
        fetchUserExercises(date).then(result => {
            const list = result.result.map((row) => ({
                id: row.id,
                setnumber: row.setnumber,
                reps: row.reps,
                weight: row.weight,
                exercise: row.exercise ? row.exercise.exercise : null,
                category: row.exercise ? row.exercise.category : null,
            }));
            setTableData(list);
        }).catch(() => setError('Could not load your exercise log'));
        fetchCatalog().then(result => {
            setCatalog(result.result);
        }).catch(() => setError('Could not load the exercise catalog'));
        setCopyFromDate(addDays(date, -1));
    }, [date]);

    const handleExerciseSelect = (exercise) => {
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

    return (
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-5'>
            <div className='flex flex-wrap items-end justify-between gap-3 mb-4'>
                <form onSubmit={handleAddSet} className='flex flex-wrap items-end gap-3'>
                    <div className='flex flex-col'>
                        <label className='text-xs font-medium text-gray-500 mb-1'>Exercise</label>
                        <select
                            value={newExercise}
                            onChange={(e) => handleExerciseSelect(e.target.value)}
                            className='border border-gray-300 rounded-xl px-3 py-1.5 text-sm min-w-[180px] transition-colors focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
                        >
                            <option value=''>Select exercise...</option>
                            {Object.keys(groupedCatalog).map((category) => (
                                <optgroup key={category} label={category}>
                                    {groupedCatalog[category].map((item) => (
                                        <option key={item.exercise} value={item.exercise}>{item.exercise}</option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>
                    </div>
                    <div className='flex flex-col'>
                        <label className='text-xs font-medium text-gray-500 mb-1'>Reps</label>
                        <input
                            type='number'
                            value={newReps}
                            onChange={(e) => setNewReps(e.target.value)}
                            className='border border-gray-300 rounded-xl px-3 py-1.5 text-sm w-20 transition-colors focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
                            placeholder='e.g. 8'
                        />
                    </div>
                    <div className='flex flex-col'>
                        <label className='text-xs font-medium text-gray-500 mb-1'>Weight (kg)</label>
                        <input
                            type='number'
                            value={newWeight}
                            onChange={(e) => setNewWeight(e.target.value)}
                            className='border border-gray-300 rounded-xl px-3 py-1.5 text-sm w-24 transition-colors focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
                            placeholder='bodyweight'
                        />
                    </div>
                    <button
                        type='submit'
                        className='flex items-center gap-1 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold px-3 py-1.5 rounded-md'
                    >
                        <PlusIcon className='w-4 h-4' /> Add Set
                    </button>
                </form>

                <div className='flex items-end gap-2'>
                    <div className='flex flex-col'>
                        <label className='text-xs font-medium text-gray-500 mb-1'>Copy from</label>
                        <input
                            type='date'
                            value={copyFromDate}
                            onChange={(e) => setCopyFromDate(e.target.value)}
                            className='border border-gray-300 rounded-xl px-3 py-1.5 text-sm transition-colors focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
                        />
                    </div>
                    <button
                        type='button'
                        onClick={handleCopy}
                        className='bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold px-3 py-1.5 rounded-md'
                    >
                        Copy Session
                    </button>
                </div>
            </div>
            {error && <div className='text-red-600 text-sm mb-3'>{error}</div>}
            <div className='overflow-x-auto'>
            <table className='w-full text-sm whitespace-nowrap'>
                <thead>
                    <tr className='text-left text-gray-500 border-b border-gray-200'>
                        <th className='py-2 font-medium'>Exercise</th>
                        <th className='py-2 font-medium'>Set</th>
                        <th className='py-2 font-medium'>Reps</th>
                        <th className='py-2 font-medium'>Weight</th>
                        <th className='py-2 font-medium text-right'>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedRows.map((row) => (
                        <tr key={row.id} className='border-b border-gray-100 last:border-0'>
                            <td className='py-2'>{row.exercise}</td>
                            <td className='py-2'>{row.setnumber}</td>
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
                                            <button onClick={() => startEdit(row)} className='text-gray-400 hover:text-indigo-600'>
                                                <PencilIcon className='w-4 h-4' />
                                            </button>
                                            <button onClick={() => handleDelete(row)} className='text-gray-400 hover:text-red-600'>
                                                <TrashIcon className='w-4 h-4' />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                    {sortedRows.length === 0 && (
                        <tr>
                            <td colSpan={5} className='py-6 text-center text-gray-400'>
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
