import React, { useEffect, useState } from 'react'
import GridLayout from "react-grid-layout";
import { Outlet, useNavigate } from "react-router";
import { Dropdown, Icon, Menu } from 'semantic-ui-react'




export function HomeView() {
  
  const [width, setWidth] = useState(window.innerWidth);


  useEffect(() => {
      const handleResize = () => setWidth(window.innerWidth);
      window.addEventListener("resize", handleResize);
      return () => {
          window.removeEventListener("resize", handleResize);
      };
  }, []);

  const layout = [
      { i: "a1", x: 0, y: 0, w: 2, h: 5, static: true}, { i: "a2", x: 2.8, y: 0.2, w: 8, h: 6, static: true },
    ];
  
       
  return <GridLayout layout={layout} cols={12} rowHeight={100} width={width} >
    <div key="a1"><Left /> </div>
    <div key="a2"><Outlet></Outlet></div>
  </GridLayout>

}


function Left() {
  const navigate = useNavigate();

  return <Menu vertical compact size="huge">
    <Menu.Item as='a' onClick={() => { navigate('/') }}>
      <div><Icon name='home' />主页</div>
    </Menu.Item>

    <Dropdown item text='卡片'>
      <Dropdown.Menu>
        <Dropdown.Item icon='credit card' text='名片01' onClick={() => { navigate("/card01")}}/>
        <Dropdown.Item icon='credit card' text='名片02' onClick={() => { navigate("/card02")}}/>
        <Dropdown.Item icon='credit card' text='名片04' onClick={() => { navigate("/card04")}}/>
      </Dropdown.Menu>
    </Dropdown>

    <Dropdown item text='标签'>
      <Dropdown.Menu>
        <Dropdown.Item icon='tags' text='标签01' onClick={() => { navigate("/tabs01")}} />
        <Dropdown.Item icon='tags' text='标签02' onClick={() => { navigate("/tabs02")}} />
        <Dropdown.Item icon='tags' text='标签03' onClick={() => { navigate("/tabs03")}} />
      </Dropdown.Menu>
    </Dropdown>

    <Dropdown item text='统计'>
      <Dropdown.Menu>
        <Dropdown.Item icon='object group outline' text='总计01' onClick={() => { navigate("/statistic01")}} />
        <Dropdown.Item icon='table' text='表格01' onClick={() => { navigate("/table01")}} />
        <Dropdown.Item icon='table' text='表格02' onClick={() => { navigate("/table02")}} />
        <Dropdown.Item icon='table' text='表格03' onClick={() => { navigate("/table03")}} />
      </Dropdown.Menu>
    </Dropdown>

    <Dropdown item text='操作'>
      <Dropdown.Menu>
        <Dropdown.Item icon='hand point right outline' text='选择01' onClick={() => { navigate("/box01")}} />
        <Dropdown.Item icon='hand point right outline' text='进度01' onClick={() => { navigate("/progress01")}} />
      </Dropdown.Menu>
    </Dropdown>

    <Dropdown item text='图表'>
      <Dropdown.Menu>
        <Dropdown.Item icon='chart pie' text='图表01' onClick={() => { navigate("/chart01")}} />
        <Dropdown.Item icon='chart bar' text='图表02' onClick={() => { navigate("/chart02")}} />
        <Dropdown.Item icon='chart pie' text='图表03' onClick={() => { navigate("/chart03")}} />
        <Dropdown.Item icon='chart line' text='图表04' onClick={() => { navigate("/chart04")}} />
        <Dropdown.Item icon='pie chart' text='图表05' onClick={() => { navigate("/chart05")}} />
        <Dropdown.Item icon='chart line' text='图表06' onClick={() => { navigate("/chart06")}} />
        <Dropdown.Item icon='chart bar' text='图表07' onClick={() => { navigate("/chart07")}} />
      </Dropdown.Menu>
    </Dropdown>
    
  </Menu>
}
