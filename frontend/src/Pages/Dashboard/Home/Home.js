import {React,useState, useEffect} from "react";
import Chart from "chart.js/auto";
import { CategoryScale } from "chart.js";
import CloriesPieChart from './components/CaloriesPieChart';
import WeightLineChart from './components/WeightLineChart';


import ReactEcharts from "echarts-for-react";

Chart.register(CategoryScale);



export default  function Home(){


    return (
        <div className='flex flex-col pt-8 ml-[65px]' id="Home">
            <div className='homeTitle text-2xl text-center mt-6 font-bold'>
              Dashboard
            </div>
            <div className='weightDashboard float-right'>
              <WeightLineChart/>
              <CloriesPieChart/>
            </div>
        </div>
        
    )
}