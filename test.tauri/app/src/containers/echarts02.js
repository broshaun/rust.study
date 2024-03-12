import ReactEcharts from 'echarts-for-react';

const MyChart2 = () => {
  // 定义图表的配置项和数据
  const option = {
    title: {
        text: '第一个 ECharts 实例'
    },
    tooltip: {},
    legend: {
        data:['销量']
    },
    xAxis: {
        data: ["衬衫","羊毛衫","雪纺衫","裤子","高跟鞋","袜子"]
    },
    yAxis: {},
    series: [{
        name: '销量',
        type: 'bar',
        data: [5, 20, 36, 10, 10, 20]
    }]
};

  return (
    <ReactEcharts
      option={option}
      style={{ height: '400px', width: '100%' }}
    />
  );
  
};

export default MyChart2;
