import React, { useEffect, useState } from 'react';
import dashboardService from '../../../../API/Services/dashboard.service';
import { PlusIcon, PencilIcon, TrashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

async function dataFunc() {
    return await dashboardService.getFoodsList();
}

async function userDataFoods() {
    return await dashboardService.getUserFoodList();
}

function calculateFoodProperties(firstFoodsList, food, amount) {
    const calculatedRow = { ...firstFoodsList.find((row) => row.food === food) };
    const prevAmount = calculatedRow.amount;
    if (prevAmount !== amount) {
        calculatedRow.protein = Math.trunc((calculatedRow.protein / prevAmount) * amount);
        calculatedRow.fats = Math.trunc((calculatedRow.fats / prevAmount) * amount);
        calculatedRow.carbs = Math.trunc((calculatedRow.carbs / prevAmount) * amount);
        calculatedRow.calories = Math.trunc((calculatedRow.calories / prevAmount) * amount);
        calculatedRow.amount = amount;
    }
    return calculatedRow;
}

const FoodLogTable = ({ handleCalcedIntake }) => {
    const [tableData, setTableData] = useState([]);
    const [firstFoodsList, setFirstFoodsList] = useState([]);
    const [newFood, setNewFood] = useState('');
    const [newAmount, setNewAmount] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editAmount, setEditAmount] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        userDataFoods().then(result => {
            const list = result.result.map((food) => {
                const { amount, ...restFood } = food.food;
                return {
                    id: food.id,
                    amount: food.amount,
                    food: restFood.food,
                    calories: Math.trunc((restFood.calories / amount) * food.amount),
                    fats: Math.trunc((restFood.fats / amount) * food.amount),
                    protein: Math.trunc((restFood.protein / amount) * food.amount),
                    carbs: Math.trunc((restFood.carbs / amount) * food.amount),
                };
            });
            setTableData(list);
            handleCalcedIntake(list);
        }).catch(() => setError('Could not load your food log'));
        dataFunc().then(result => {
            setFirstFoodsList(result.result);
        }).catch(() => setError('Could not load the food catalog'));
    }, [handleCalcedIntake]);

    const handleAddFood = async (e) => {
        e.preventDefault();
        const amount = Number(newAmount);
        if (!newFood || !amount || amount <= 0) {
            setError('Select a food and enter a valid amount');
            return;
        }
        setError('');

        const calcedValues = calculateFoodProperties(firstFoodsList, newFood, amount);
        const added = await dashboardService.addUserFood(newFood, amount);
        calcedValues.id = added.result.id;

        const updated = [...tableData, calcedValues];
        setTableData(updated);
        handleCalcedIntake(updated);
        setNewFood('');
        setNewAmount('');
    };

    const startEdit = (row) => {
        setEditingId(row.id);
        setEditAmount(row.amount);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditAmount('');
    };

    const saveEdit = async (row) => {
        const amount = Number(editAmount);
        if (!amount || amount <= 0) {
            return;
        }

        const calcedValues = calculateFoodProperties(firstFoodsList, row.food, amount);
        await dashboardService.updateUserFoodAmount(row.id, amount);

        const updated = tableData.map((r) => (r.id === row.id ? { ...r, ...calcedValues, id: row.id } : r));
        setTableData(updated);
        handleCalcedIntake(updated);
        cancelEdit();
    };

    const handleDelete = async (row) => {
        await dashboardService.deleteUserFood(row.id);
        const updated = tableData.filter((r) => r.id !== row.id);
        setTableData(updated);
        handleCalcedIntake(updated);
    };

    return (
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-5'>
            <form onSubmit={handleAddFood} className='flex flex-wrap items-end gap-3 mb-4'>
                <div className='flex flex-col'>
                    <label className='text-xs font-medium text-gray-500 mb-1'>Food</label>
                    <select
                        value={newFood}
                        onChange={(e) => setNewFood(e.target.value)}
                        className='border border-gray-300 rounded-md px-2 py-1.5 text-sm min-w-[160px]'
                    >
                        <option value=''>Select food...</option>
                        {firstFoodsList.map((food) => (
                            <option key={food.food} value={food.food}>{food.food}</option>
                        ))}
                    </select>
                </div>
                <div className='flex flex-col'>
                    <label className='text-xs font-medium text-gray-500 mb-1'>Amount (g)</label>
                    <input
                        type='number'
                        value={newAmount}
                        onChange={(e) => setNewAmount(e.target.value)}
                        className='border border-gray-300 rounded-md px-2 py-1.5 text-sm w-24'
                        placeholder='e.g. 150'
                    />
                </div>
                <button
                    type='submit'
                    className='flex items-center gap-1 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold px-3 py-1.5 rounded-md'
                >
                    <PlusIcon className='w-4 h-4' /> Add
                </button>
                {error && <div className='text-red-600 text-sm'>{error}</div>}
            </form>
            <table className='w-full text-sm'>
                <thead>
                    <tr className='text-left text-gray-500 border-b border-gray-200'>
                        <th className='py-2 font-medium'>Food</th>
                        <th className='py-2 font-medium'>Amount</th>
                        <th className='py-2 font-medium'>Calories</th>
                        <th className='py-2 font-medium'>Protein</th>
                        <th className='py-2 font-medium'>Carbs</th>
                        <th className='py-2 font-medium'>Fats</th>
                        <th className='py-2 font-medium text-right'>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {tableData.map((row) => (
                        <tr key={row.id} className='border-b border-gray-100 last:border-0'>
                            <td className='py-2'>{row.food}</td>
                            <td className='py-2'>
                                {editingId === row.id
                                    ? <input
                                        type='number'
                                        value={editAmount}
                                        onChange={(e) => setEditAmount(e.target.value)}
                                        className='border border-gray-300 rounded px-1.5 py-0.5 w-20 text-sm'
                                        autoFocus
                                    />
                                    : `${row.amount}g`}
                            </td>
                            <td className='py-2'>{row.calories}</td>
                            <td className='py-2'>{row.protein}g</td>
                            <td className='py-2'>{row.carbs}g</td>
                            <td className='py-2'>{row.fats}g</td>
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
                    {tableData.length === 0 && (
                        <tr>
                            <td colSpan={7} className='py-6 text-center text-gray-400'>No food logged yet today.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default FoodLogTable;
