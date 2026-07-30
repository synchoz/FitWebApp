import React, { useState, useEffect } from "react";
import ReactEcharts from "echarts-for-react";
import dashboardService from "../../../../API/Services/dashboard.service";

async function dataFunc() {
    return await dashboardService.getWeight();
}



export default function WeightLineChart(){
    const [firstWeightsData, setFirstWeightsData] = useState([]);
    const [firstDateData, setFirstDateData] = useState([]);
    
    useEffect(() => {
        // Fetch the data inside the useEffect hook
        dataFunc().then(result => {
          var weights = result.result.map(weightlog => weightlog.weight);
          var dates = result.result.map(weightlog => weightlog.logdate);
          setFirstDateData(dates);
          setFirstWeightsData(weights); // or any other transformation needed
        }).catch(() => {});
      }, []); // Empty dependency array to run the effect only on mount

    const option = {
        title: {
            text: 'Weight logs in KGs',
            left: 'center'
        },
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
            type: 'category',
            data: firstDateData
        },
        yAxis: {
        type: 'value'
        },
        series: [
        {
            tooltip: {
              valueFormatter: value => value + ' KGs'
            },
            data: firstWeightsData,
            type: 'line',
            label: {
              show: true,
              position: 'top'
            }
        }
        ]
    }; 
    return (
    <ReactEcharts
        option={option}
        style={{ height: "40vh", left: 0, top: 50, width: "90vw" }} 
    />
    );
}




