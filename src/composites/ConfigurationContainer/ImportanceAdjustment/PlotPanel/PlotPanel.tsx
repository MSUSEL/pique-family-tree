import { Box, Flex } from "@radix-ui/themes";
import * as Tabs from '@radix-ui/react-tabs';
import './style.css';
import Plot from 'react-plotly.js';

export interface ChartData{
  name: string,         // the name of the entry
  value : number,       // the characteristic value (represents x coord of point)
  importance : number,  // the adjusted importance (represents slope)
  impacts: number[]     // the values to graph (every 0.1 for now)
}

// color blind colors
export const cb_colors = ['#00429d', '#4771b2', '#a5d5d8', '#ffbcaf', '#cf3759', '#93003a'];

/***
 * Renders a Pie chart according to the contributions
 *
 * @param {array} pieData array that contains string and number values
 */
export const Pie_Chart = (pieData : {name: string; value: number;}[]) => {

  let _labels : string[] = [];
  pieData.forEach((entry) => {
    _labels.push(entry.name);
  });

  let _values : number[] = [];
  pieData.forEach((entry) => {
    _values.push(entry.value);
  });

  return (
    <Plot
        data={[{
            name: 'Contribution',
            values: _values,
            labels: _labels,
            type: 'pie',
            textinfo: 'label+percent',
            textposition: 'outside',
            sort: false,
            marker:{
              colors: cb_colors
            }
        }]}
        layout={{
            title: 'Contributions',
            height: 400,
            width: 400,
            showlegend: false,
        }}
    />
  );
}

/***
 * Renders the Sensitivy chart according to the importance and values
 * 
 * @param {ChartData[]} charts array of chart nodes
 * @param {number} score the overall score of the software
 * @param {number} x_ticks the interval at which each data point is calculated
 * @param {number} threshold the desired value for the score
 */
//export function SensitivityChart({names, values, score,  impacts, x_ticks, threshold}){
export function SensitivityChart(charts : ChartData[], score: number, x_ticks: number[], threshold : number){
  const n_nodes = charts.length;
  const node_idx = Array.from({ length: n_nodes }, (_, i) => i);

  let traceData = [];
  let valData =[]
  let color_idx : number = 0;

  for (let idx in node_idx){

      let trace = {
          name: charts[idx].name,
          y: charts[idx].impacts,
          x: x_ticks,
          type: 'scatter',
          mode: 'lines',
          line:{
            color: cb_colors[color_idx++]
          }
      };

      let val_point ={
          name: charts[idx].name + ' value',
          x: [charts[idx].value],
          y: [score],
          type: 'scatter',
          mode: 'markers',
          showlegend: false,
          marker: {color: 'black', size: 8 }
      };

      traceData.push(trace);
      valData.push(val_point);
  }

  let scoreTrace ={
      name: "score",
      x: [0, 1],
      y: [score, score],
      type: 'scatter',
      mode: 'lines',
      marker:{color: 'black'},
      line: {dash: 'dot'},
  }

  let thresholdTrace={
          name: "Threshold",
          x: [0, 1],
          y: [threshold, threshold],
          type: 'scatter',
          mode: 'lines',
          marker: {color: 'red'},
          line: {dash: 'dashdot'},
  }

  traceData = traceData.concat(valData, [scoreTrace], [thresholdTrace])

  return(
      <Plot
          data={traceData}
          layout={{
              title: 'Sensitivity',
              height: 500,
              width: 450,
              yaxis: {title: "Score", range:[0,1.1]},
              xaxis: {title: "values", range:[0,1.1]}
          }}
      />
  );
}

/***
 * Renders the views to the right of the adjustment table, pie chart, sensitivities, and strategies
 * 
 * @param {{name: string; value: number}[]} pieData array of pie datas
 * @param {ChartData[]} charts array of chart nodes
 * @param {number} updatedTQI
 * @param {number[]} x_tick the interval at which each data point is calculated
 * @param {number} threshold the desired value for the score
 * @param {string} strategy
 * @param {function} onStrategyChanged
 * @param {{[key: string]: number}} strategyValues
 */
export function TabWindow(pieData : {name: string; value: number;}[], chartData: ChartData[], updatedTQIRaw: number, x_tick: number[], threshold: number,
  strategy : string, onStrategyChanged : (name : string) => void, strategyValues : {[key: string]: number}) {

  return(
    <Flex direction="column" gap="4">
      <Tabs.Root className="TabsRoot" defaultValue="tab1">
          <Tabs.List className="TabsList" aria-label="Addditional details">
              <Tabs.Trigger className="TabsTrigger" value="tab1">
                  Contributions
              </Tabs.Trigger>
              <Tabs.Trigger className="TabsTrigger" value="tab2">
                  Sensitivity
              </Tabs.Trigger>
              <Tabs.Trigger className="TabsTrigger" value="tab3">
                  Impacts
              </Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content className="TabsContent" value="tab1">
              <p className="Text">Provides Information about Contributions</p>
              {Pie_Chart(pieData)}
          </Tabs.Content>
          <Tabs.Content className="TabsContent" value="tab2">
              <p className="Text">Provides Information about Sensitivity</p>
              {SensitivityChart(chartData, updatedTQIRaw, x_tick, threshold)}
          </Tabs.Content>
          <Tabs.Content className="TabsContent" value="tab3">
              <p className="Text">Provides Information about Impacts</p>
              {StrategySelect(strategy, onStrategyChanged)}
              {recommendationList(strategyValues)}
          </Tabs.Content>
      </Tabs.Root>
    </Flex>
  );
}

/***
 * Renders the views to the right of the adjustment table, pie chart, sensitivities, and strategies
 * 
 * @param {string} selectValue the active strategy
 * @param {function} onStrategyChanged
 */
export function StrategySelect(selectValue : string, handleChange : (name : string) => void){
  
  return(
    <label>
        Strategy :
        <select
            name="selecStartegy"
            value={selectValue}
            onChange={e => handleChange(e.target.value)}
        >
            <option value="Lowest">Lowest</option>
            <option value="Fastest">Fastest</option>
            <option value="LowestEffort">Lowest Effort</option>
            <option value="Custom">Custom 1</option>
        </select>
    </label>
  );
}

export function recommendationList(impacts : {[key: string]: number}){

  return(
  <div className="Recommendations">
  <p style={{ color: 'black' }}>Recommendation priority list</p>
  <ol style={{ color: 'black' }}>
    {Object.keys(impacts).map((key) => (
      <li key={key}>
        {key}: {impacts[key]}
      </li>
    ))}
  </ol>
  </div>
  );
}