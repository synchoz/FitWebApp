import React, { useEffect, useMemo, useState } from "react";
import ReactEcharts from "echarts-for-react";
import dashboardService from "../../../../API/Services/dashboard.service";
import { getLoggedExerciseNames, buildDailyBestOneRepMax, formatLogDate } from "../utils/oneRepMax";

const SERIES_COLOR = "#6366f1"; // matches the app's indigo accent (bg-indigo-500)

const CHART_TYPES = [
    { value: "line", label: "Line" },
    { value: "bar", label: "Bar" },
];

async function fetchSets() {
    const response = await dashboardService.getUserExerciseHistory();
    return response.result.map((row) => ({
        logdate: row.logdate,
        reps: row.reps,
        weight: row.weight,
        exercise: row.exercise ? row.exercise.exercise : null,
    }));
}

function buildChartOption(selectedExercise, chartType, points) {
    const isLine = chartType === "line";
    return {
        title: {
            text: selectedExercise ? `Estimated 1RM — ${selectedExercise}` : "Estimated 1RM",
            left: "center",
        },
        tooltip: { trigger: "axis" },
        xAxis: {
            type: "category",
            data: points.map((point) => formatLogDate(point.logdate)),
        },
        yAxis: {
            type: "value",
            scale: true,
            name: "KGs",
        },
        series: [
            {
                name: selectedExercise,
                tooltip: { valueFormatter: (value) => `${value} KGs (est.)` },
                data: points.map((point) => point.oneRepMax),
                type: chartType,
                smooth: isLine,
                areaStyle: isLine ? { opacity: 0.08 } : undefined,
                itemStyle: { color: SERIES_COLOR },
                lineStyle: isLine ? { color: SERIES_COLOR, width: 2 } : undefined,
                label: { show: true, position: "top" },
            },
        ],
    };
}

export default function OneRepMaxChart() {
    const [sets, setSets] = useState([]);
    const [selectedExercise, setSelectedExercise] = useState("");
    const [chartType, setChartType] = useState("line");
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        fetchSets().then((result) => {
            setSets(result);
            const [firstExercise] = getLoggedExerciseNames(result);
            setSelectedExercise(firstExercise || "");
            setLoaded(true);
        }).catch(() => setLoaded(true));
    }, []);

    const exerciseNames = useMemo(() => getLoggedExerciseNames(sets), [sets]);
    const points = useMemo(
        () => (selectedExercise ? buildDailyBestOneRepMax(sets, selectedExercise) : []),
        [sets, selectedExercise]
    );

    if (loaded && exerciseNames.length === 0) {
        return (
            <div className='flex items-center justify-center text-slate-400 text-sm' style={{ height: '40vh', width: '100%' }}>
                No weighted exercises logged yet — add some sets from the Calendar page.
            </div>
        );
    }

    return (
        <div className='weightDashboard w-full'>
            <div className='flex flex-wrap items-center justify-center gap-3 mb-2'>
                <div className='flex flex-col'>
                    <label className='text-xs font-medium text-gray-500 mb-1' htmlFor='one-rm-exercise'>Exercise</label>
                    <select
                        id='one-rm-exercise'
                        value={selectedExercise}
                        onChange={(e) => setSelectedExercise(e.target.value)}
                        className='border border-gray-300 rounded-xl px-3 py-1.5 text-sm min-w-[180px] transition-colors focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
                    >
                        {exerciseNames.map((name) => (
                            <option key={name} value={name}>{name}</option>
                        ))}
                    </select>
                </div>
                <div className='flex flex-col'>
                    <span className='text-xs font-medium text-gray-500 mb-1'>Chart type</span>
                    <div className='flex rounded-xl border border-gray-300 overflow-hidden'>
                        {CHART_TYPES.map(({ value, label }) => (
                            <button
                                key={value}
                                type='button'
                                onClick={() => setChartType(value)}
                                className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                                    chartType === value ? 'bg-indigo-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            <ReactEcharts
                option={buildChartOption(selectedExercise, chartType, points)}
                style={{ height: "40vh", width: "100%" }}
            />
        </div>
    );
}
