import React, { useEffect, useState } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import dashboardService from '../../../../API/Services/dashboard.service';
import adminService from '../../../../API/Services/admin.service';
import getErrorMessage from '../../../../API/getErrorMessage';

const EMPTY_FORM = { food: '', calories: '', protein: '', carbs: '', fats: '', amount: '' };

export default function AdminFoodCatalog() {
    const [foods, setFoods] = useState([]);
    const [error, setError] = useState('');
    const [editingFood, setEditingFood] = useState(null);
    const [editValues, setEditValues] = useState(EMPTY_FORM);
    const [newFood, setNewFood] = useState(EMPTY_FORM);

    const loadFoods = () => {
        dashboardService.getFoodsList().then(
            (result) => setFoods(result.result),
            (err) => setError(getErrorMessage(err))
        );
    };

    useEffect(loadFoods, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await dashboardService.addFood(newFood.food, newFood.calories, newFood.protein, newFood.carbs, newFood.fats, newFood.amount);
            setNewFood(EMPTY_FORM);
            loadFoods();
        } catch (err) {
            setError(getErrorMessage(err));
        }
    };

    const startEdit = (row) => {
        setEditingFood(row.food);
        setEditValues({ ...row });
    };

    const cancelEdit = () => setEditingFood(null);

    const saveEdit = async () => {
        try {
            await adminService.updateFood(editingFood, {
                calories: editValues.calories,
                protein: editValues.protein,
                carbs: editValues.carbs,
                fats: editValues.fats,
                amount: editValues.amount,
            });
            setEditingFood(null);
            loadFoods();
        } catch (err) {
            setError(getErrorMessage(err));
        }
    };

    const handleDelete = async (row) => {
        try {
            await adminService.deleteFood(row.food);
            loadFoods();
        } catch (err) {
            setError(getErrorMessage(err));
        }
    };

    const numberInput = (value, onChange, width = 'w-16') => (
        <input
            type='number'
            value={value}
            onChange={onChange}
            className={`border border-gray-300 rounded-lg px-2 py-0.5 ${width} text-sm transition-colors focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100`}
        />
    );

    return (
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-5'>
            <div className='text-sm text-gray-500 mb-3'>Food Catalog</div>

            <form onSubmit={handleAdd} className='grid grid-cols-2 sm:flex sm:flex-wrap sm:items-end gap-3 mb-4 bg-gray-50 border border-gray-200 rounded-xl p-3'>
                <div className='col-span-2 sm:col-auto flex flex-col'>
                    <label className='text-xs font-medium text-gray-500 mb-1'>Food name</label>
                    <input
                        type='text'
                        value={newFood.food}
                        onChange={(e) => setNewFood({ ...newFood, food: e.target.value })}
                        className='border border-gray-300 rounded-xl px-3 py-2 text-sm w-full sm:min-w-[160px] transition-colors focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
                        placeholder='e.g. Banana'
                    />
                </div>
                {['calories', 'protein', 'carbs', 'fats', 'amount'].map((field) => (
                    <div key={field} className='flex flex-col'>
                        <label className='text-xs font-medium text-gray-500 mb-1 capitalize'>{field}</label>
                        <input
                            type='number'
                            value={newFood[field]}
                            onChange={(e) => setNewFood({ ...newFood, [field]: e.target.value })}
                            className='border border-gray-300 rounded-xl px-3 py-2 text-sm w-20 transition-colors focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
                        />
                    </div>
                ))}
                <button
                    type='submit'
                    className='col-span-2 sm:col-auto flex items-center justify-center gap-1 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold px-3 py-2 rounded-md w-full sm:w-auto'
                >
                    <PlusIcon className='w-4 h-4' /> Add Food
                </button>
            </form>

            {error && <div className='text-red-600 text-sm mb-3'>{error}</div>}

            <div className='overflow-x-auto'>
                <table className='w-full text-sm whitespace-nowrap'>
                    <thead>
                        <tr className='text-left text-gray-500 border-b border-gray-200'>
                            <th className='py-2 font-medium'>Food</th>
                            <th className='py-2 font-medium'>Calories</th>
                            <th className='py-2 font-medium'>Protein</th>
                            <th className='py-2 font-medium'>Carbs</th>
                            <th className='py-2 font-medium'>Fats</th>
                            <th className='py-2 font-medium'>Amount</th>
                            <th className='py-2 font-medium text-right'>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {foods.map((row) => {
                            const isEditing = editingFood === row.food;
                            return (
                                <tr key={row.food} className='border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors'>
                                    <td className='py-2 font-medium text-gray-800'>{row.food}</td>
                                    <td className='py-2'>{isEditing ? numberInput(editValues.calories, (e) => setEditValues({ ...editValues, calories: e.target.value })) : row.calories}</td>
                                    <td className='py-2'>{isEditing ? numberInput(editValues.protein, (e) => setEditValues({ ...editValues, protein: e.target.value })) : row.protein}</td>
                                    <td className='py-2'>{isEditing ? numberInput(editValues.carbs, (e) => setEditValues({ ...editValues, carbs: e.target.value })) : row.carbs}</td>
                                    <td className='py-2'>{isEditing ? numberInput(editValues.fats, (e) => setEditValues({ ...editValues, fats: e.target.value })) : row.fats}</td>
                                    <td className='py-2'>{isEditing ? numberInput(editValues.amount, (e) => setEditValues({ ...editValues, amount: e.target.value })) : row.amount}</td>
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
