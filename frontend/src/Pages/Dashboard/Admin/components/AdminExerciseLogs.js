import React, { useEffect, useState } from 'react';
import { PencilIcon, TrashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import adminService from '../../../../API/Services/admin.service';
import getErrorMessage from '../../../../API/getErrorMessage';
import Select from '../../../../components/ui/Select';

export default function AdminExerciseLogs() {
    const [users, setUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [logs, setLogs] = useState([]);
    const [selectedExercise, setSelectedExercise] = useState('');
    const [error, setError] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editReps, setEditReps] = useState('');
    const [editWeight, setEditWeight] = useState('');

    useEffect(() => {
        adminService.getUsers().then(
            (result) => setUsers(result.result),
            (err) => setError(getErrorMessage(err))
        );
    }, []);

    const loadLogs = (userId) => {
        adminService.getUserExerciseLog(userId).then(
            (result) => {
                const sorted = [...result.result].sort((a, b) => {
                    if (a.logdate !== b.logdate) return b.logdate.localeCompare(a.logdate);
                    const exerciseA = a.exercise ? a.exercise.exercise : '';
                    const exerciseB = b.exercise ? b.exercise.exercise : '';
                    if (exerciseA !== exerciseB) return exerciseA.localeCompare(exerciseB);
                    return a.setnumber - b.setnumber;
                });
                setLogs(sorted);
            },
            (err) => setError(getErrorMessage(err))
        );
    };

    const handleSelectUser = (userId) => {
        setSelectedUserId(userId);
        setSelectedExercise('');
        setError('');
        setEditingId(null);
        loadLogs(userId);
    };

    const exerciseNames = [...new Set(logs.map((row) => (row.exercise ? row.exercise.exercise : null)).filter(Boolean))].sort();
    const visibleLogs = selectedExercise ? logs.filter((row) => row.exercise && row.exercise.exercise === selectedExercise) : logs;

    const startEdit = (row) => {
        setEditingId(row.id);
        setEditReps(row.reps);
        setEditWeight(row.weight === null || row.weight === undefined ? '' : row.weight);
    };

    const cancelEdit = () => setEditingId(null);

    const saveEdit = async (row) => {
        try {
            await adminService.updateExerciseLog(row.id, editReps, editWeight === '' ? null : editWeight);
            setEditingId(null);
            loadLogs(selectedUserId);
        } catch (err) {
            setError(getErrorMessage(err));
        }
    };

    const handleDelete = async (row) => {
        try {
            await adminService.deleteExerciseLog(row.id);
            loadLogs(selectedUserId);
        } catch (err) {
            setError(getErrorMessage(err));
        }
    };

    const selectedUser = users.find((u) => String(u.id) === String(selectedUserId));

    return (
        <div className='bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5'>
            <div className='flex flex-col sm:flex-row sm:items-end gap-3 mb-4'>
                <div className='flex flex-col'>
                    <label className='text-xs font-medium text-gray-500 dark:text-gray-400 mb-1'>User</label>
                    <Select
                        value={selectedUserId}
                        onChange={handleSelectUser}
                        placeholder='Select a user...'
                        displayLabel={selectedUser ? `${selectedUser.username} (${selectedUser.email})` : undefined}
                        className='sm:min-w-[260px]'
                    >
                        {users.map((u) => (
                            <Select.Option key={u.id} value={u.id} label={`${u.username} (${u.email})`} />
                        ))}
                    </Select>
                </div>
                {selectedUserId && exerciseNames.length > 0 && (
                    <div className='flex flex-col'>
                        <label className='text-xs font-medium text-gray-500 dark:text-gray-400 mb-1'>Exercise</label>
                        <Select
                            value={selectedExercise}
                            onChange={setSelectedExercise}
                            placeholder='All exercises'
                            displayLabel={selectedExercise || undefined}
                            className='sm:min-w-[200px]'
                        >
                            <Select.Option value='' label='All exercises' />
                            <Select.Divider />
                            {exerciseNames.map((name) => (
                                <Select.Option key={name} value={name} label={name} />
                            ))}
                        </Select>
                    </div>
                )}
            </div>

            {error && <div className='text-red-600 dark:text-red-400 text-sm mb-3'>{error}</div>}

            {!selectedUserId ? (
                <div className='py-6 text-center text-gray-400 dark:text-gray-500 text-sm'>Select a user to view their exercise log.</div>
            ) : logs.length === 0 ? (
                <div className='py-6 text-center text-gray-400 dark:text-gray-500 text-sm'>No exercise log entries for this user.</div>
            ) : visibleLogs.length === 0 ? (
                <div className='py-6 text-center text-gray-400 dark:text-gray-500 text-sm'>No entries for this exercise.</div>
            ) : (
                <div className='overflow-x-auto'>
                    <table className='w-full text-sm whitespace-nowrap'>
                        <thead>
                            <tr className='text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700'>
                                <th className='py-2 font-medium'>Date</th>
                                <th className='py-2 font-medium'>Exercise</th>
                                <th className='py-2 font-medium w-16'>Set</th>
                                <th className='py-2 font-medium'>Reps</th>
                                <th className='py-2 font-medium'>Weight</th>
                                <th className='py-2 font-medium text-right'>Actions</th>
                            </tr>
                        </thead>
                        <tbody className='text-gray-700 dark:text-gray-200'>
                            {visibleLogs.map((row) => (
                                <tr key={row.id} className='border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors'>
                                    <td className='py-2'>{row.logdate}</td>
                                    <td className='py-2'>{row.exercise ? row.exercise.exercise : '—'}</td>
                                    <td className='py-2 text-gray-400 dark:text-gray-500'>{row.setnumber}</td>
                                    <td className='py-2'>
                                        {editingId === row.id
                                            ? <input
                                                type='number'
                                                value={editReps}
                                                onChange={(e) => setEditReps(e.target.value)}
                                                className='border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg px-2 py-0.5 w-16 text-sm transition-colors focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
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
                                                placeholder='bodyweight'
                                                className='border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg px-2 py-0.5 w-20 text-sm transition-colors focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
                                            />
                                            : (row.weight === null || row.weight === undefined ? 'bodyweight' : `${row.weight}kg`)}
                                    </td>
                                    <td className='py-2'>
                                        <div className='flex items-center justify-end gap-2'>
                                            {editingId === row.id ? (
                                                <>
                                                    <button onClick={() => saveEdit(row)} className='text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300'>
                                                        <CheckIcon className='w-4 h-4' />
                                                    </button>
                                                    <button onClick={cancelEdit} className='text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'>
                                                        <XMarkIcon className='w-4 h-4' />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button onClick={() => startEdit(row)} className='text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400'>
                                                        <PencilIcon className='w-4 h-4' />
                                                    </button>
                                                    <button onClick={() => handleDelete(row)} className='text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400'>
                                                        <TrashIcon className='w-4 h-4' />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
