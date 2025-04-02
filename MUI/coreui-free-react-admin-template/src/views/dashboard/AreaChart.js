import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { GridComponent, TooltipComponent, ToolboxComponent, DataZoomComponent, LegendComponent } from 'echarts/components';
import { LineChart } from 'echarts/charts';
import { UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
    GridComponent, 
    LineChart, 
    CanvasRenderer, 
    UniversalTransition, 
    TooltipComponent, 
    ToolboxComponent, 
    DataZoomComponent,
    LegendComponent
]);

const AreaChart = ({ series = [], xAxisData = [] }) => {
    const chartRef = useRef(null);

    useEffect(() => {
        // Get the dates sorted in descending order
        const sortedDates = xAxisData.map(date => new Date(date)).sort((a, b) => b - a);
        const latestDate = sortedDates[0];
        const previousDate = sortedDates.find(date => 
            date.getFullYear() !== latestDate.getFullYear() ||
            date.getMonth() !== latestDate.getMonth() ||
            date.getDate() !== latestDate.getDate()
        ) || latestDate;

        console.log('Previous day data point:', {
            date: previousDate.toISOString(),
            values: series.map(s => ({
            name: s.name,
            value: s.data[xAxisData.indexOf(previousDate.toISOString())]
            }))
        });

        const myChart = echarts.init(chartRef.current);

        // Sort dates in ascending order (oldest to newest)
        const sortedData = xAxisData.map((date, index) => ({
            date: new Date(date),
            index
        })).sort((a, b) => a.date - b.date);

        const formattedDates = sortedData.map(item => 
            `${item.date.getDate().toString().padStart(2, '0')} ${item.date.toLocaleString('default', { month: 'short' })} ${item.date.getFullYear()}`
        );

        const option = {
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross',
                    label: {
                        backgroundColor: '#6a7985'
                    }
                }
            },
            legend: {
                data: series.map(s => s.name),
                top: 0
            },
            toolbox: {
                feature: {
                    dataZoom: {
                        yAxisIndex: 'none'
                    },
                    restore: {},
                    saveAsImage: {}
                }
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: formattedDates,
                axisLabel: {
                    rotate: 45,
                    interval: 'auto',
                    textStyle: {
                        fontSize: 11  // Slightly reduce font size to accommodate more text
                    }
                }
            },
            yAxis: {
                type: 'value',
                splitLine: {
                    lineStyle: {
                        type: 'dashed',
                        color: 'rgba(255,255,255,0.2)'
                    }
                },
                axisLabel: {
                    formatter: '{value}',
                    textStyle: {
                        color: '#fff'
                    }
                }
            },
            dataZoom: [
                {
                    type: 'inside',
                    start: 0,
                    end: 100,
                    filterMode: 'none'
                },
                {
                    start: 0,
                    end: 100,
                    filterMode: 'none'
                }
            ],
            series: series.map(s => ({
                name: s.name,
                type: 'line',
                smooth: true, // Makes the line smoother
                symbol: 'circle',
                symbolSize: 6,
                sampling: 'lttb',
                itemStyle: {
                    opacity: 0.8
                },
                areaStyle: {
                    opacity: 0.3
                },
                data: sortedData.map(item => s.data[item.index])
            }))
        };

        myChart.setOption(option);

        // Handle resize
        const handleResize = () => myChart.resize();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            myChart.dispose();
        };
    }, [series, xAxisData]);

    return <div ref={chartRef} style={{ width: '100%', height: '400px' }} />;
};

export default AreaChart;