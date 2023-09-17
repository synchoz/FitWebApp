import {React,useState, useEffect} from "react";
import ReactEcharts from "echarts-for-react";
import authService from "../../../../API/Services/auth.service";
import dashboardService from "../../../../API/Services/dashboard.service";


function calcPercent(totalIntake, prefOutput) {
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
async function userDataFoods(currentUser) {
    return await dashboardService.getUserFoodList(currentUser);
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
    const [currentUser, setCurrentUser] = useState(JSON.parse(authService.getCurrentUser()).username);
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
    useEffect(() => {
      console.log('current user: ',currentUser);
      userDataFoods(currentUser).then(res => {
        handleCalcedIntake(res.result).then(res => {
          console.log('output of foods ', res);
          setTotalIntake(res)
          setTotalPercent({
            Proteins:calcPercent(res,'proteins'),
            Fats:calcPercent(res,'fats'),
            Carbs:calcPercent(res,'carbs')
        })
        }
          )
      })
  }, []);
    const option = {
        title: {
        text: `Intake Calories: ${totalIntake.totalCalories}`,
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
            { value: totalIntake.totalFats * 9, name: `${totalIntake.totalFats} Fats (${totalPercent.Fats}%)` },
            { value: totalIntake.totalCarbs * 4, name: `${totalIntake.totalCarbs} Carbs (${totalPercent.Carbs}%)` },
            { value: totalIntake.totalProteins * 4, name: `${totalIntake.totalProteins} Proteins (${totalPercent.Proteins}%)` }
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