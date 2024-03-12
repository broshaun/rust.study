
import { HashRouter, Routes, Route } from "react-router-dom";
import { HomeView } from "./containers/home";
import ImageExampleCircular from "./containers/index01";
import { CardExampleCard } from "./containers/card01"
import CardExampleGroups from "./containers/card02";
import PopupExampleTrigger from "./containers/card04";
import LabelExampleFloating from "./containers/tabs01";
import LabelExampleImage from "./containers/tabs02";
import LabelExampleRibbon from "./containers/tabs03";
import StatisticExampleInverted from "./containers/statistic01";
import TableExamplePagination from "./containers/table01";
import TableExamplePadded from "./containers/table02";
import TableExampleCollapsing from "./containers/table03";
import CheckboxExampleFitted from "./containers/box01";
import ProgressExampleIndicating from "./containers/progress01";
import MyChart from "./containers/echarts01";
import MyChart2 from "./containers/echarts02";
import MyChart3 from "./containers/echarts03";
import MyChart4 from "./containers/echarts04";
import MyChart5 from "./containers/echarts05";
import MyChart6 from "./containers/echarts06";
import MyChart7 from "./containers/echarts07";


function App() {
    return <HashRouter>
        <Routes>
            <Route path="" element={<HomeView />} >
                <Route index element={<ImageExampleCircular />} />
                <Route path="/card01" element={<CardExampleCard />} />
                <Route path="/card02" element={<CardExampleGroups />} />
                <Route path="/card04" element={<PopupExampleTrigger />} />
                <Route path="/tabs01" element={<LabelExampleFloating />} />
                <Route path="/tabs02" element={<LabelExampleImage />} />
                <Route path="/tabs03" element={<LabelExampleRibbon />} />
                <Route path="/statistic01" element={<StatisticExampleInverted />} />
                <Route path="/table01" element={<TableExamplePagination />} />
                <Route path="/table02" element={<TableExamplePadded />} />
                <Route path="/table03" element={<TableExampleCollapsing />} />
                <Route path="/box01" element={<CheckboxExampleFitted />} />
                <Route path="/progress01" element={<ProgressExampleIndicating />} />
                <Route path="/chart01" element={<MyChart />} />
                <Route path="/chart02" element={<MyChart2 />} />
                <Route path="/chart03" element={<MyChart3 />} />
                <Route path="/chart04" element={<MyChart4 />} />
                <Route path="/chart05" element={<MyChart5 />} />
                <Route path="/chart06" element={<MyChart6 />} />
                <Route path="/chart07" element={<MyChart7 />} />
            </Route>

        </Routes>
    </HashRouter>
}


export default App;

