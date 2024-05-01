import {React,useState} from "react";
import DataGridTable from "./components/DataGridTable";
import DatePickerCustom from "./components/DatePickerCustom";
import authService from "../../../API/Services/auth.service";
import dashboardService from "../../../API/Services/dashboard.service";


export default function Calendar() {
    const [weight, setWeight] = useState(0);
    const [date, setDate] = useState('');
    const [currentUser, setCurrentUser] = useState(JSON.parse(authService.getCurrentUser()).username);
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [calcedIntake, setCalcedIntake] = useState({
        totalCalories: 0,
        totalProteins: 0,
        totalFats: 0,
        totalCarbs: 0});

    const handleChange = (event) => {
        setMessage("");
        setWeight(event.target.value);
    };

    const handleCalcedIntake = async (data) => {
        const totals = await data.reduce((accumulator, currentValue) => {
            return {
                totalCalories: accumulator.totalCalories + (currentValue.calories || 0),
                totalProteins: accumulator.totalProteins + (currentValue.proteins || 0),
                totalFats: accumulator.totalFats + (currentValue.fats || 0),
                totalCarbs: accumulator.totalCarbs + (currentValue.carbs || 0)
            };
        }, {
            totalCalories: 0,
            totalProteins: 0,
            totalFats: 0,
            totalCarbs: 0
        });
        setCalcedIntake(totals);
    }

    const handleSubmit = (e) => {
        
        e.preventDefault();
      /*   setLoading(true); */
        setMessage("");
        const isError =  weight > 0 && date.length > 0 ? false : true ;

        if(!isError) {
            dashboardService.addWeight(currentUser, weight, date).then(
                () => {
                    console.log('success');
                    setMessage("Weight was succesfuly added!");
                    setIsSuccess(true);
                   /*  setTimeout(() => setRegisterSeen(false), 2000); */
                },
                (error) => {
                    const resMessage = 
                        (error.response && 
                            error.response.data &&
                            error.response.data.message) ||
                        error.message ||
                        error.toString();
                        console.log(resMessage);
                        /* setLoading(false); */
                        setMessage(resMessage);
                }
            )
        } else {
            /* setLoading(false); */
            setMessage('Missing details');
            console.log('error');
        }
        
    }

    return (
        <div className="flex flex-col ml-[65px]">
            <div className="flex justify-center mt-4 text-2xl font-semibold">Calorie Intake</div>
            <div className="mx-6"><DataGridTable handleCalcedIntake={handleCalcedIntake}/></div>
            <div className="flex flex-col border-b-2 mx-5 pb-2">
                <div className="flex justify-center mt-10 text-2xl font-semibold mb-2">Total Intake</div>
                <div className="flex flex-row justify-around">
                    <div>
                        <div className="font-bold">Calories:</div>
                        <div>{calcedIntake.totalCalories}</div>
                    </div>
                    <div>
                        <div className="font-bold">Proteins:</div>
                        <div>{calcedIntake.totalProteins}</div>
                    </div>
                    <div>
                        <div className="font-bold">Carbs:</div>
                        <div>{calcedIntake.totalCarbs}</div>
                    </div>
                    <div>
                        <div className="font-bold">Fats:</div>
                        <div>{calcedIntake.totalFats}</div>
                    </div>
                </div>
            </div>
            
            <div className="border-b-2 mx-5">
                <div className="flex justify-center mt-10 text-2xl font-semibold ">Add Weight Log</div>
                <div className="flex justify-center mt-4">
                    <form onSubmit={handleSubmit} className="flex flex-wrap gap-5 justify-center items-center mb-2">   
                        <div className="mx-2 border rounded">
                            <input 
                                placeholder="Weight in KGs"
                                onChange={handleChange}
                                type="tel" 
                                pattern="[0-9]*"/>
                        </div>
                        <div className="mx-2"><DatePickerCustom setDate={setDate}/></div>
                        <button className="rpy-2 py-2 px-4 bg-indigo-500 text-white text-sm font-semibold rounded-md shadow focus:outline-none"
                                type="submit">Save Log
                        </button>
                    </form>
                    {message && (
                            <div className="text-center mt-4">
                                <div className={`font-bold text-2xl ${isSuccess? "text-green-700":"text-red-700"}`}>{message}</div>
                            </div>
                        )}
                </div>
            </div>
        </div>
    )
}