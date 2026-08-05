import React, { useState, useEffect } from "react";
import ReactEcharts from "echarts-for-react";
import dashboardService from "../../../../API/Services/dashboard.service";
import { CHART_COLORS, axisTextStyle, axisLineStyle, splitLineStyle, tooltipStyle } from "../utils/chartTheme";

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
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-5'>
                <div className='text-lg font-semibold text-gray-800 mb-2'>Weight</div>
                <div className='flex items-center justify-center text-gray-400 text-sm' style={{ height: '30vh' }}>
                    No weight logs yet — add one from the Calendar page.
                </div>
            </div>
        );
    }

    const option = {
        grid: { left: 48, right: 20, top: 16, bottom: 32 },
        tooltip: {
            trigger: 'axis',
            ...tooltipStyle,
            valueFormatter: value => `${value} KGs`,
        },
        xAxis: {
            type: 'category',
            data: firstDateData,
            axisLine: axisLineStyle,
            axisTick: { show: false },
            axisLabel: axisTextStyle,
        },
        yAxis: {
            type: 'value',
            scale: true,
            name: 'KGs',
            nameTextStyle: axisTextStyle,
            splitLine: splitLineStyle,
            axisLabel: axisTextStyle,
        },
        series: [
        {
            data: firstWeightsData,
            type: 'line',
            smooth: true,
            symbolSize: 7,
            itemStyle: { color: CHART_COLORS.indigo },
            lineStyle: { color: CHART_COLORS.indigo, width: 2 },
            areaStyle: { color: CHART_COLORS.indigo, opacity: 0.08 },
        }
        ]
    };
    return (
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-5'>
            <div className='text-lg font-semibold text-gray-800 mb-2'>Weight</div>
            <ReactEcharts
                option={option}
                style={{ height: "30vh", width: "100%" }}
            />
        </div>
    );
}
