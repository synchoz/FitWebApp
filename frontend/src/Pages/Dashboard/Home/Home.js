import React from "react";
import CloriesPieChart from './components/CaloriesPieChart';
import WeightLineChart from './components/WeightLineChart';
import OneRepMaxChart from './components/OneRepMaxChart';

export default  function Home(){


    return (
        <div className='flex flex-col pt-8 ml-14 md:ml-[220px]' id="Home">
            <div className='homeTitle text-2xl text-center mt-6 font-bold'>
              Dashboard
            </div>
            <div className='weightDashboard flex flex-col items-center md:block md:float-right'>
              <WeightLineChart/>
              <CloriesPieChart/>
              <OneRepMaxChart/>
            </div>
        </div>
        
    )
}