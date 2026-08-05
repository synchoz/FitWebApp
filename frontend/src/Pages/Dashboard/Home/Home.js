import React from "react";
import CloriesPieChart from './components/CaloriesPieChart';
import WeightLineChart from './components/WeightLineChart';
import OneRepMaxChart from './components/OneRepMaxChart';

export default  function Home(){
    return (
        <div className='flex flex-col ml-14 md:ml-[220px] px-4 sm:px-6 py-6 gap-4 bg-gray-50 min-h-screen' id="Home">
            <div className='text-2xl font-semibold text-gray-800'>Dashboard</div>
            <WeightLineChart/>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                <CloriesPieChart/>
                <OneRepMaxChart/>
            </div>
        </div>
    )
}