import {React} from "react";
import DataGridTable from "./components/DataGridTable";
import DatePickerCustom from "./components/DatePickerCustom";


export default function Calendar() {
    return (
        <div className="flex flex-col">
            <div className="flex justify-center mt-4 text-2xl font-semibold">Calorie Intake</div>
            <div className="mx-6"><DataGridTable/></div>
            <div className="flex justify-center mt-10 text-2xl font-semibold">Add Weight Log</div>
            <div className="flex justify-center content-center items-center mt-4">
                <div className="mx-2 border rounded border-indigo-600 py-[14px]"><input type="text" placeholder="Weight in KGs"/></div>
                <div className="mx-2"><DatePickerCustom/></div>
                <button className="ml-5 rpy-2 py-2 px-4 bg-indigo-500 text-white text-sm font-semibold rounded-md shadow focus:outline-none">Save Log</button>
            </div>
        </div>
    )
}