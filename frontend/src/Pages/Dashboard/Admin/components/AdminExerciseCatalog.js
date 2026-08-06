import React, { useEffect, useState } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import dashboardService from '../../../../API/Services/dashboard.service';
import adminService from '../../../../API/Services/admin.service';
import getErrorMessage from '../../../../API/getErrorMessage';

export default function AdminExerciseCatalog() {
    const [exercises, setExercises] = useState([]);
    const [error, setError] = useState('');
    const [editingExercise, setEditingExercise] = useState(null);
    const [editCategory, setEditCategory] = useState('');
    const [newExercise, setNewExercise] = useState('');
    const [newCategory, setNewCategory] = useState('');

    const loadExercises = () => {
        dashboardService.getExercisesList().then(
            (result) => setExercises(result.result),
            (err) => setError(getErrorMessage(err))
        );
    };

    useEffect(loadExercises, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await dashboardService.addExercise(newExercise, newCategory);
            setNewExercise('');
            setNewCategory('');
            loadExercises();
        } catch (err) {
            setError(getErrorMessage(err));
        }
    };

    const startEdit = (row) => {
        setEditingExercise(row.exercise);
        setEditCategory(row.category || '');
    };

    const cancelEdit = () => setEditingExercise(null);

    const saveEdit = async () => {
        try {
            await adminService.updateExercise(editingExercise, editCategory);
            setEditingExercise(null);
            loadExercises();
        } catch (err) {
            setError(getErrorMessage(err));
        }
    };

    const handleDelete = async (row) => {
        try {
            await adminService.deleteExercise(row.exercise);
            loadExercises();
        } catch (err) {
            setError(getErrorMessage(err));
        }
    };

    return (
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-5'>
            <div className='text-sm text-gray-500 mb-3'>Exercise Catalog</div>

            <form onSubmit={handleAdd} className='grid grid-cols-2 sm:flex sm:flex-wrap sm:items-end gap-3 mb-4 bg-gray-50 border border-gray-200 rounded-xl p-3'>
                <div className='col-span-2 sm:col-auto flex flex-col'>
                    <label className='text-xs font-medium text-gray-500 mb-1'>Exercise name</label>
                    <input
                        type='text'
                        value={newExercise}
                        onChange={(e) => setNewExercise(e.target.value)}
                        className='border border-gray-300 rounded-xl px-3 py-2 text-sm w-full sm:min-w-[180px] transition-colors focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
                        placeholder='e.g. Cable Fly'
                    />
                </div>
                <div className='col-span-2 sm:col-auto flex flex-col'>
                    <label className='text-xs font-medium text-gray-500 mb-1'>Category</label>
                    <input
                        type='text'
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className='border border-gray-300 rounded-xl px-3 py-2 text-sm w-full sm:min-w-[140px] transition-colors focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
                        placeholder='e.g. Chest'
                    />
                </div>
                <button
                    type='submit'
                    className='col-span-2 sm:col-auto flex items-center justify-center gap-1 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold px-3 py-2 rounded-md w-full sm:w-auto'
                >
                    <PlusIcon className='w-4 h-4' /> Add Exercise
                </button>
            </form>

            {error && <div className='text-red-600 text-sm mb-3'>{error}</div>}

            <div className='overflow-x-auto'>
                <table className='w-full text-sm whitespace-nowrap'>
                    <thead>
                        <tr className='text-left text-gray-500 border-b border-gray-200'>
                            <th className='py-2 font-medium'>Exercise</th>
                            <th className='py-2 font-medium'>Category</th>
                            <th className='py-2 font-medium text-right'>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {exercises.map((row) => {
                            const isEditing = editingExercise === row.exercise;
                            return (
                                <tr key={row.exercise} className='border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors'>
                                    <td className='py-2 font-medium text-gray-800'>{row.exercise}</td>
                                    <td className='py-2'>
                                        {isEditing
                                            ? <input
                                                type='text'
                                                value={editCategory}
                                                onChange={(e) => setEditCategory(e.target.value)}
                                                className='border border-gray-300 rounded-lg px-2 py-0.5 w-32 text-sm transition-colors focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
                                                autoFocus
                                            />
                                            : row.category}
                                    </td>
                                    <td className='py-2'>
                                        <div className='flex items-center justify-end gap-2'>
                                            {isEditing ? (
                                                <>
                                                    <button onClick={saveEdit} className='text-green-600 hover:text-green-700'>
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
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
