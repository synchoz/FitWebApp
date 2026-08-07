import React, { useEffect, useState } from 'react';
import { PencilIcon, TrashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import adminService from '../../../../API/Services/admin.service';
import getErrorMessage from '../../../../API/getErrorMessage';
import Select from '../../../../components/ui/Select';
import DatePicker from '../../../../components/ui/DatePicker';

// Backend sends logdate as en-GB `toLocaleString()`, i.e. "DD/MM/YYYY, HH:MM:SS" - convert
// to an ISO "YYYY-MM-DD" for the DatePicker, which expects/emits ISO strings.
function toIsoDate(logdate) {
    const [datePart] = logdate.split(',');
    const [day, month, year] = datePart.split('/');
    return `${year}-${month}-${day}`;
}

function formatDate(logdate) {
    const [year, month, day] = toIsoDate(logdate).split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AdminWeightLogs() {
    const [users, setUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [logs, setLogs] = useState([]);
    const [error, setError] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editWeight, setEditWeight] = useState('');
    const [editDate, setEditDate] = useState('');

    useEffect(() => {
        adminService.getUsers().then(
            (result) => setUsers(result.result),
            (err) => setError(getErrorMessage(err))
        );
    }, []);

    const loadLogs = (userId) => {
        adminService.getUserWeightLogs(userId).then(
            (result) => setLogs(result.result),
            (err) => setError(getErrorMessage(err))
        );
    };

    const handleSelectUser = (userId) => {
        setSelectedUserId(userId);
        setError('');
        setEditingId(null);
        loadLogs(userId);
    };

    const startEdit = (row) => {
        setEditingId(row.id);
        setEditWeight(row.weight);
        setEditDate(toIsoDate(row.logdate));
    };

    const cancelEdit = () => {
        setEditingId(null);
    };

    const saveEdit = async (row) => {
        try {
            await adminService.updateWeightLog(row.id, editWeight, editDate);
            setEditingId(null);
            loadLogs(selectedUserId);
        } catch (err) {
            setError(getErrorMessage(err));
        }
    };

    const handleDelete = async (row) => {
        try {
            await adminService.deleteWeightLog(row.id);
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
            </div>

            {error && <div className='text-red-600 dark:text-red-400 text-sm mb-3'>{error}</div>}

            {!selectedUserId ? (
                <div className='py-6 text-center text-gray-400 dark:text-gray-500 text-sm'>Select a user to view their weight logs.</div>
            ) : logs.length === 0 ? (
                <div className='py-6 text-center text-gray-400 dark:text-gray-500 text-sm'>No weight logs for this user.</div>
            ) : (
                <div className='overflow-x-auto'>
                    <table className='w-full text-sm whitespace-nowrap'>
                        <thead>
                            <tr className='text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700'>
                                <th className='py-2 font-medium'>Date</th>
                                <th className='py-2 font-medium'>Weight (kg)</th>
                                <th className='py-2 font-medium text-right'>Actions</th>
                            </tr>
                        </thead>
                        <tbody className='text-gray-700 dark:text-gray-200'>
                            {logs.map((row) => (
                                <tr key={row.id} className='border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors'>
                                    <td className='py-2'>
                                        {editingId === row.id
                                            ? <DatePicker value={editDate} onChange={setEditDate} className='w-40' />
                                            : formatDate(row.logdate)}
                                    </td>
                                    <td className='py-2'>
                                        {editingId === row.id
                                            ? <input
                                                type='text'
                                                inputMode='decimal'
                                                value={editWeight}
                                                onChange={(e) => setEditWeight(e.target.value)}
                                                className='border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg px-2 py-0.5 w-20 text-sm transition-colors focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
                                                autoFocus
                                            />
                                            : `${row.weight} kg`}
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
