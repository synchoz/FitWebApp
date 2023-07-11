import React, { Component } from "react";
import ReactEcharts from "echarts-for-react";
export default function WeightLineChart(){
    const option = {
        title: {
            text: 'Weight logs in KGs',
            left: 'center'
        },
        tooltip: {
            trigger: 'axis',
            formatter: function (params) {
            params = params[0];
            return (
                'test' +
                '/' +
                'test' +
                '/' +
                'test'
            );
        },
        axisPointer: {
            animation: false
            }
        },
        xAxis: {
            type: 'category',
            data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']
        },
        yAxis: {
        type: 'value'
        },
        series: [
        {
            data: [84, 72, 70, 71, 70, 68, 66,  68, 66],
            type: 'line'
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




