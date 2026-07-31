import {React,useState,useCallback} from "react";
import DataGridTable from "./components/DataGridTable";
import DatePickerCustom from "./components/DatePickerCustom";
import dashboardService from "../../../API/Services/dashboard.service";
import getErrorMessage from "../../../API/getErrorMessage";


export default function Calendar() {
    const [weight, setWeight] = useState(0);
    const [date, setDate] = useState('');
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [calcedIntake, setCalcedIntake] = useState({
        totalCalories: 0,
        totalProtein: 0,
        totalFats: 0,
        totalCarbs: 0});

    const handleChange = (event) => {
        setMessage("");
        setWeight(event.target.value);
    };

    const handleCalcedIntake = useCallback(async (data) => {
        const totals = await data.reduce((accumulator, currentValue) => {
            return {
                totalCalories: accumulator.totalCalories + (currentValue.calories || 0),
                totalProtein: accumulator.totalProtein + (currentValue.protein || 0),
                totalFats: accumulator.totalFats + (currentValue.fats || 0),
                totalCarbs: accumulator.totalCarbs + (currentValue.carbs || 0)
            };
        }, {
            totalCalories: 0,
            totalProtein: 0,
            totalFats: 0,
            totalCarbs: 0
        });
        setCalcedIntake(totals);
    }, []);

    const handleSubmit = (e) => {
        
        e.preventDefault();
      /*   setLoading(true); */
        setMessage("");
        const isError =  weight > 0 && date.length > 0 ? false : true ;

        if(!isError) {
            dashboardService.addWeight(weight, date).then(
                () => {
                    setMessage("Weight was succesfuly added!");
                    setIsSuccess(true);
                   /*  setTimeout(() => setRegisterSeen(false), 2000); */
                },
                (error) => {
                    /* setLoading(false); */
                    setMessage(getErrorMessage(error));
                }
            )
        } else {
            /* setLoading(false); */
            setMessage('Missing details');
        }
        
    }

    const stats = [
        { icon: '🔥', label: 'Calories', value: calcedIntake.totalCalories },
        { icon: '💪', label: 'Protein', value: `${calcedIntake.totalProtein}g` },
        { icon: '🌾', label: 'Carbs', value: `${calcedIntake.totalCarbs}g` },
        { icon: '🥑', label: 'Fats', value: `${calcedIntake.totalFats}g` },
    ];

    return (
        <div className="flex flex-col ml-[220px] px-6 py-6 gap-6 bg-gray-50 min-h-screen">
            <div className="text-2xl font-semibold text-gray-800">Calorie Intake</div>

            <DataGridTable handleCalcedIntake={handleCalcedIntake}/>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                            <span>{stat.icon}</span> {stat.label}
                        </div>
                        <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 max-w-xl">
                <div className="text-lg font-semibold text-gray-800 mb-4">Add Weight Log</div>
                <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4">
                    <div className="flex flex-col">
                        <label className="text-xs font-medium text-gray-500 mb-1">Weight (kg)</label>
                        <input
                            placeholder="e.g. 72.5"
                            onChange={handleChange}
                            type="tel"
                            pattern="[0-9]*"
                            className="border border-gray-300 rounded-xl px-3 py-1.5 text-sm w-32 transition-colors focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-xs font-medium text-gray-500 mb-1">Date</label>
                        <DatePickerCustom setDate={setDate}/>
                    </div>
                    <button
                        className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-md shadow focus:outline-none"
                        type="submit"
                    >
                        Save Log
                    </button>
                </form>
                <div className={`mt-3 min-h-[1.5rem] font-semibold ${isSuccess ? "text-green-600" : "text-red-600"}`}>{message}</div>
            </div>
        </div>
    )
}