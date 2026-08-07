import React, { useEffect, useMemo, useState } from "react";
import ReactEcharts from "echarts-for-react";
import dashboardService from "../../../../API/Services/dashboard.service";
import { getLoggedExerciseNames, buildDailyBestOneRepMax, formatLogDate } from "../utils/oneRepMax";
import { CHART_COLORS, getChartTheme } from "../utils/chartTheme";
import { useTheme } from "../../../../components/ThemeContext/ThemeContext";
import Select from "../../../../components/ui/Select";

const SERIES_COLOR = CHART_COLORS.indigo; // matches the app's indigo accent (bg-indigo-500)

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

function buildChartOption(selectedExercise, chartType, points, chartTheme) {
    const { axisTextStyle, axisLineStyle, splitLineStyle, tooltipStyle } = chartTheme;
    const isLine = chartType === "line";
    return {
        grid: { left: 48, right: 20, top: 16, bottom: 32 },
        tooltip: { trigger: "axis", ...tooltipStyle },
        xAxis: {
            type: "category",
            data: points.map((point) => formatLogDate(point.logdate)),
            axisLine: axisLineStyle,
            axisTick: { show: false },
            axisLabel: axisTextStyle,
        },
        yAxis: {
            type: "value",
            scale: true,
            name: "KGs",
            nameTextStyle: axisTextStyle,
            splitLine: splitLineStyle,
            axisLabel: axisTextStyle,
        },
        series: [
            {
                name: selectedExercise,
                tooltip: { valueFormatter: (value) => `${value} KGs (est.)` },
                data: points.map((point) => point.oneRepMax),
                type: chartType,
                smooth: isLine,
                symbolSize: 7,
                areaStyle: isLine ? { color: SERIES_COLOR, opacity: 0.08 } : undefined,
                itemStyle: { color: SERIES_COLOR },
                lineStyle: isLine ? { color: SERIES_COLOR, width: 2 } : undefined,
            },
        ],
    };
}

export default function OneRepMaxChart() {
    const { theme } = useTheme();
    const chartTheme = getChartTheme(theme === 'dark');
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
            <div className='bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5'>
                <div className='text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2'>Estimated 1RM</div>
                <div className='flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm' style={{ height: '30vh' }}>
                    No weighted exercises logged yet — add some sets from the Calendar page.
                </div>
            </div>
        );
    }

    return (
        <div className='bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5'>
            <div className='flex flex-wrap items-center justify-between gap-3 mb-4'>
                <div className='text-lg font-semibold text-gray-800 dark:text-gray-100'>
                    Estimated 1RM{selectedExercise ? <span className='text-gray-400 dark:text-gray-500 font-normal'> · {selectedExercise}</span> : null}
                </div>
                <div className='flex flex-wrap items-end gap-3'>
                    <div className='flex flex-col'>
                        <label className='text-xs font-medium text-gray-500 dark:text-gray-400 mb-1' htmlFor='one-rm-exercise'>Exercise</label>
                        <Select
                            value={selectedExercise}
                            onChange={setSelectedExercise}
                            className='min-w-[180px]'
                        >
                            {exerciseNames.map((name) => (
                                <Select.Option key={name} value={name} label={name} />
                            ))}
                        </Select>
                    </div>
                    <div className='flex flex-col'>
                        <span className='text-xs font-medium text-gray-500 dark:text-gray-400 mb-1'>Chart type</span>
                        <div className='flex rounded-xl border border-gray-300 dark:border-gray-600 overflow-hidden'>
                            {CHART_TYPES.map(({ value, label }) => (
                                <button
                                    key={value}
                                    type='button'
                                    onClick={() => setChartType(value)}
                                    className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                                        chartType === value ? 'bg-indigo-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <ReactEcharts
                option={buildChartOption(selectedExercise, chartType, points, chartTheme)}
                style={{ height: "30vh", width: "100%" }}
            />
        </div>
    );
}
