import react from 'react';
import ReactEcharts from "echarts-for-react";

export default function CloriesPieChart(){
    
    const option = {
        title: {
        text: 'Intake Calories',
        left: 'center'
        },
        tooltip: {
        trigger: 'item'
        },
        series: [
        {
            name: 'Calories From',
            type: 'pie',
            radius: '50%',
            data: [
            { value: 700, name: 'Fats (40%)' },
            { value: 400, name: 'Carbs (25%)' },
            { value: 500, name: 'Protein (35%)' }
            ],
            emphasis: {
            itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
            }
        }
        ]
    };
    return (
        <div className='weightDashboard'>
            <ReactEcharts 
                style={{ height: "30vh", left: 50, top: 50, width: "70vw" }} 
                option={option} 
            />
        </div>
)}