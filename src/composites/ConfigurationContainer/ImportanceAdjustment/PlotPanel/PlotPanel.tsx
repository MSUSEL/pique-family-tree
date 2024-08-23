import './style.css';
import Plot from 'react-plotly.js';
//import { PieChart, Pie, Cell, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts";
const COLORS = ['#41afaa', '#466eb4', '#aa998f', '#e6a532', '#d7642c', '#af4b91'];


/***
 * Renders a Pie chart according to the contributions
 *
 * @param {array} pieData array that contains string and number values
 */
export const Pie_Chart = (pieData : {name: string; value: number;}[]) => {

  console.log("pie chart returned");

  let _labels : string[] = [];
  pieData.forEach((entry) => {
    _labels.push(entry.name);
  });

  let _values : number[] = [];
  pieData.forEach((entry) => {
    _values.push(entry.value);
  });

  console.log('names: ' + _labels);
  console.log('_values: ' + _values);

  return (
    <Plot
        data={[{
            name: 'Contribution',
            values: _values,
            labels: _labels,
            type: 'pie',
            textinfo: 'label+percent',
            textposition: 'outside',
            sort: false
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