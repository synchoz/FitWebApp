import React, { useState, useEffect } from "react";
import ReactEcharts from "echarts-for-react";
import dashboardService from "../../../../API/Services/dashboard.service";

async function dataFunc() {
    return await dashboardService.getWeight();
}



// Backend sends logdate as en-GB `toLocaleString()`, i.e. "DD/MM/YYYY, HH:MM:SS".
// new Date(string) parses ambiguous slash dates as MM/DD, silently corrupting any day <= 12,
// so parse the known DD/MM/YYYY layout explicitly instead.
function parseLogDate(value) {
    const [datePart] = value.split(',');
    const [day, month, year] = datePart.split('/').map(Number);
    return new Date(year, month - 1, day);
}

function formatDate(value) {
    const parsed = parseLogDate(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function WeightLineChart(){
    const [firstWeightsData, setFirstWeightsData] = useState([]);
    const [firstDateData, setFirstDateData] = useState([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        // Fetch the data inside the useEffect hook
        dataFunc().then(result => {
          const sorted = [...result.result].sort((a, b) => parseLogDate(a.logdate) - parseLogDate(b.logdate));
          const weights = sorted.map(weightlog => weightlog.weight);
          const dates = sorted.map(weightlog => formatDate(weightlog.logdate));
          setFirstDateData(dates);
          setFirstWeightsData(weights); // or any other transformation needed
          setLoaded(true);
        }).catch(() => setLoaded(true));
      }, []); // Empty dependency array to run the effect only on mount

    if (loaded && firstWeightsData.length === 0) {
        return (
            <div className='flex items-center justify-center text-slate-400 text-sm' style={{ height: '40vh', width: '100%' }}>
                No weight logs yet — add one from the Calendar page.
            </div>
        );
    }

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
            type: 'value',
            scale: true,
            name: 'KGs'
        },
        series: [
        {
            tooltip: {
              valueFormatter: value => value + ' KGs'
            },
            data: firstWeightsData,
            type: 'line',
            smooth: true,
            areaStyle: { opacity: 0.08 },
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
        style={{ height: "40vh", width: "100%" }}
    />
    );
}




