import {React,useState, useEffect} from "react";
import ReactEcharts from "echarts-for-react";
import dashboardService from "../../../../API/Services/dashboard.service";
import { todayIso } from "../../../../utils/date";
import { CHART_COLORS, getChartTheme } from "../utils/chartTheme";
import { useTheme } from "../../../../components/ThemeContext/ThemeContext";


function calcPercent(totalIntake, prefOutput) {
    if (!totalIntake.totalCalories) return "0.00";
    var percent = 0;
    switch (prefOutput) {
        case 'proteins':
            percent = (totalIntake.totalProteins * 4) / (totalIntake.totalCalories)
            break;
        case 'carbs':
            percent = (totalIntake.totalCarbs * 4) / (totalIntake.totalCalories)
            break;
        case 'fats':
            percent = (totalIntake.totalFats * 9) / (totalIntake.totalCalories)
            break;
        default:
            break;
    }

    return (percent*100).toFixed(2);
}
async function userDataFoods() {
    return await dashboardService.getUserFoodList(todayIso());
  }

  const handleCalcedIntake = async (data) => {

    var list = await data.map((food) => {
      const { amount, ...restFood } = food.food;
      return {
        id: food.id,
        amount: food.amount,
        food: restFood.food,
        calories: Math.trunc((restFood.calories/amount) * food.amount),
        fats: Math.trunc((restFood.fats/amount) * food.amount),
        proteins: Math.trunc((restFood.protein/amount) * food.amount),
        carbs: Math.trunc((restFood.carbs/amount) * food.amount)
      }
    });

    const totals = await list.reduce((accumulator, currentValue) => {
        return {
            totalCalories: accumulator.totalCalories + (currentValue.calories || 0),
            totalProteins: accumulator.totalProteins + (currentValue.proteins || 0),
            totalFats: accumulator.totalFats + (currentValue.fats || 0),
            totalCarbs: accumulator.totalCarbs + (currentValue.carbs || 0)
        };
    }, {
        totalCalories: 0,
        totalProteins: 0,
        totalFats: 0,
        totalCarbs: 0
    });
    return totals;
  }

export default function CloriesPieChart({data}){
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const { tooltipStyle, legendTextStyle } = getChartTheme(isDark);
    const [totalPercent, setTotalPercent] = useState({
        Proteins: 0,
        Fats: 0,
        Carbs: 0
    })
    const [totalIntake, setTotalIntake] = useState({
      totalCalories: 0,
      totalProteins: 0,
      totalFats: 0,
      totalCarbs: 0
    })
    const [loaded, setLoaded] = useState(false);
    useEffect(() => {
      userDataFoods().then(res => {
        handleCalcedIntake(res.result).then(res => {
          setTotalIntake(res)
          setTotalPercent({
            Proteins:calcPercent(res,'proteins'),
            Fats:calcPercent(res,'fats'),
            Carbs:calcPercent(res,'carbs')
        })
          setLoaded(true);
        }
          )
      }).catch(() => setLoaded(true))
  }, []);

    if (loaded && totalIntake.totalCalories === 0) {
        return (
            <div className='bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5'>
                <div className='text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2'>Today's Calories</div>
                <div className='flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm' style={{ height: '26vh' }}>
                    No food logged today — add some from the Calendar page.
                </div>
            </div>
        );
    }

    const option = {
        tooltip: {
            trigger: 'item',
            ...tooltipStyle,
        },
        legend: {
            bottom: 0,
            icon: 'circle',
            itemWidth: 10,
            itemHeight: 10,
            textStyle: legendTextStyle,
        },
        series: [
        {
            name: 'Calories From',
            type: 'pie',
            radius: ['40%', '65%'],
            center: ['50%', '46%'],
            avoidLabelOverlap: true,
            itemStyle: {
                borderColor: isDark ? '#1f2937' : '#ffffff',
                borderWidth: 2,
            },
            label: {
                formatter: '{b}\n{d}%',
                color: isDark ? '#d1d5db' : '#52514e',
                fontSize: 12,
            },
            data: [
            { value: totalIntake.totalProteins * 4, name: `Proteins (${totalIntake.totalProteins}g)`, itemStyle: { color: CHART_COLORS.indigo } },
            { value: totalIntake.totalCarbs * 4, name: `Carbs (${totalIntake.totalCarbs}g)`, itemStyle: { color: CHART_COLORS.amber } },
            { value: totalIntake.totalFats * 9, name: `Fats (${totalIntake.totalFats}g)`, itemStyle: { color: CHART_COLORS.emerald } },
            ],
            emphasis: {
            itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.15)'
            }
            }
        }
        ]
    };
    return (
        <div className='bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5'>
            <div className='text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2'>Today's Calories: {totalIntake.totalCalories}</div>
            <ReactEcharts
                style={{ height: "30vh", width: "100%" }}
                option={option}
            />
        </div>
)}