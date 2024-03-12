import ReactEcharts from 'echarts-for-react';

const MyChart = () => {
  // 定义图表的配置项和数据
  const option = {
    series: {
        type: 'sunburst',
        data: [{
            name: 'A',
            value: 10,
            children: [{
                value: 3,
                name: 'Aa'
            }, {
                value: 5,
                name: 'Ab'
            }]
        }, {
            name: 'B',
            children: [{
                name: 'Ba',
                value: 4
            }, {
                name: 'Bb',
                value: 2
            }]
        }, {
            name: 'C',
            value: 3
        }]
    }
};

  return (
    <ReactEcharts
      option={option}
      style={{ height: '400px', width: '100%' }}
    />
  );

};

export default MyChart;
