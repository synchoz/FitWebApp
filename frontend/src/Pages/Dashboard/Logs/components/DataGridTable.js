import React, { useEffect, useState } from 'react';
import dashboardService from '../../../../API/Services/dashboard.service';
import getErrorMessage from '../../../../API/getErrorMessage';
import { todayIso } from '../../../../utils/date';
import { PlusIcon, PencilIcon, TrashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

const NEW_FOOD_OPTION = '__new__';

async function dataFunc() {
    return await dashboardService.getFoodsList();
}

async function userDataFoods(date) {
    return await dashboardService.getUserFoodList(date);
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

const FoodLogTable = ({ handleCalcedIntake, date }) => {
    const [tableData, setTableData] = useState([]);
    const [firstFoodsList, setFirstFoodsList] = useState([]);
    const [newFood, setNewFood] = useState('');
    const [newAmount, setNewAmount] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editAmount, setEditAmount] = useState('');
    const [error, setError] = useState('');
    const [showNewFoodForm, setShowNewFoodForm] = useState(false);
    const [newFoodName, setNewFoodName] = useState('');
    const [newFoodAmount, setNewFoodAmount] = useState('100');
    const [newFoodCalories, setNewFoodCalories] = useState('');
    const [newFoodProtein, setNewFoodProtein] = useState('');
    const [newFoodCarbs, setNewFoodCarbs] = useState('');
    const [newFoodFats, setNewFoodFats] = useState('');

    useEffect(() => {
        userDataFoods(date).then(result => {
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
    }, [handleCalcedIntake, date]);

    const handleAddFood = async (e) => {
        e.preventDefault();
        const amount = Number(newAmount);
        if (!newFood || !amount || amount <= 0) {
            setError('Select a food and enter a valid amount');
            return;
        }
        setError('');

        const calcedValues = calculateFoodProperties(firstFoodsList, newFood, amount);
        const added = await dashboardService.addUserFood(newFood, amount, date);
        calcedValues.id = added.result.id;

        const updated = [...tableData, calcedValues];
        setTableData(updated);
        handleCalcedIntake(updated);
        setNewFood('');
        setNewAmount('');
    };

    const handleFoodSelect = (value) => {
        if (value === NEW_FOOD_OPTION) {
            setShowNewFoodForm(true);
            setNewFood('');
            return;
        }
        setNewFood(value);
    };

    const cancelNewFood = () => {
        setShowNewFoodForm(false);
        setNewFoodName('');
        setNewFoodAmount('100');
        setNewFoodCalories('');
        setNewFoodProtein('');
        setNewFoodCarbs('');
        setNewFoodFats('');
    };

    const handleCreateFood = async (e) => {
        e.preventDefault();
        const amount = Number(newFoodAmount);
        if (!newFoodName.trim() || !amount || amount <= 0) {
            setError('Enter a food name and a valid reference amount');
            return;
        }
        setError('');
        try {
            const created = await dashboardService.addFood(
                newFoodName.trim(),
                Number(newFoodCalories) || 0,
                Number(newFoodProtein) || 0,
                Number(newFoodCarbs) || 0,
                Number(newFoodFats) || 0,
                amount
            );
            setFirstFoodsList([...firstFoodsList, created.result]);
            setNewFood(created.result.food);
            cancelNewFood();
        } catch (err) {
            setError(getErrorMessage(err));
        }
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
                        onChange={(e) => handleFoodSelect(e.target.value)}
                        className='border border-gray-300 rounded-xl px-3 py-1.5 text-sm min-w-[160px] transition-colors focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
                    >
                        <option value=''>Select food...</option>
                        <option value={NEW_FOOD_OPTION}>+ Add new food...</option>
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
                        className='border border-gray-300 rounded-xl px-3 py-1.5 text-sm w-24 transition-colors focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
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
            {showNewFoodForm && (
                <form onSubmit={handleCreateFood} className='flex flex-wrap items-end gap-3 mb-4 bg-gray-50 border border-gray-200 rounded-xl p-3'>
                    <div className='flex flex-col'>
                        <label className='text-xs font-medium text-gray-500 mb-1'>Food name</label>
                        <input
                            type='text'
                            value={newFoodName}
                            onChange={(e) => setNewFoodName(e.target.value)}
                            className='border border-gray-300 rounded-xl px-3 py-1.5 text-sm min-w-[160px] transition-colors focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
                            placeholder='e.g. Greek Yogurt'
                            autoFocus
                        />
                    </div>
                    <div className='flex flex-col'>
                        <label className='text-xs font-medium text-gray-500 mb-1'>Per amount (g)</label>
                        <input
                            type='number'
                            value={newFoodAmount}
                            onChange={(e) => setNewFoodAmount(e.target.value)}
                            className='border border-gray-300 rounded-xl px-3 py-1.5 text-sm w-24 transition-colors focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
                        />
                    </div>
                    <div className='flex flex-col'>
                        <label className='text-xs font-medium text-gray-500 mb-1'>Calories</label>
                        <input
                            type='number'
                            value={newFoodCalories}
                            onChange={(e) => setNewFoodCalories(e.target.value)}
                            className='border border-gray-300 rounded-xl px-3 py-1.5 text-sm w-20 transition-colors focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
                        />
                    </div>
                    <div className='flex flex-col'>
                        <label className='text-xs font-medium text-gray-500 mb-1'>Protein (g)</label>
                        <input
                            type='number'
                            value={newFoodProtein}
                            onChange={(e) => setNewFoodProtein(e.target.value)}
                            className='border border-gray-300 rounded-xl px-3 py-1.5 text-sm w-20 transition-colors focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
                        />
                    </div>
                    <div className='flex flex-col'>
                        <label className='text-xs font-medium text-gray-500 mb-1'>Carbs (g)</label>
                        <input
                            type='number'
                            value={newFoodCarbs}
                            onChange={(e) => setNewFoodCarbs(e.target.value)}
                            className='border border-gray-300 rounded-xl px-3 py-1.5 text-sm w-20 transition-colors focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
                        />
                    </div>
                    <div className='flex flex-col'>
                        <label className='text-xs font-medium text-gray-500 mb-1'>Fats (g)</label>
                        <input
                            type='number'
                            value={newFoodFats}
                            onChange={(e) => setNewFoodFats(e.target.value)}
                            className='border border-gray-300 rounded-xl px-3 py-1.5 text-sm w-20 transition-colors focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
                        />
                    </div>
                    <button
                        type='submit'
                        className='flex items-center gap-1 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold px-3 py-1.5 rounded-md'
                    >
                        <CheckIcon className='w-4 h-4' /> Save food
                    </button>
                    <button
                        type='button'
                        onClick={cancelNewFood}
                        className='flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold px-3 py-1.5 rounded-md'
                    >
                        <XMarkIcon className='w-4 h-4' /> Cancel
                    </button>
                </form>
            )}
            <div className='overflow-x-auto'>
            <table className='w-full text-sm whitespace-nowrap'>
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
                                        className='border border-gray-300 rounded-lg px-2 py-0.5 w-20 text-sm transition-colors focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
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
                            <td colSpan={7} className='py-6 text-center text-gray-400'>
                                {date === todayIso() ? 'No food logged yet today.' : 'No food logged for this day.'}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
            </div>
        </div>
    );
};

export default FoodLogTable;
