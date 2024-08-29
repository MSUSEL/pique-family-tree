import { useState, useCallback } from "react";
import {
  Button,
  Flex,
  Text,
  HoverCard,
  Link,
  Strong,
  Callout,
  Box,
  Separator,
  IconButton,
} from "@radix-ui/themes";
import { InfoCircledIcon, GearIcon, Cross2Icon } from "@radix-ui/react-icons";
import * as Dialog from "@radix-ui/react-dialog";
import * as Tabs from "@radix-ui/react-tabs";
import "../Style/Dialog.css";
import {ChartData, Pie_Chart, SensitivityChart} from "./ImportanceAdjustment/PlotPanel/PlotPanel.tsx";
import { AdjustmentTableLogic } from "./ImportanceAdjustment/AdjustmentTable/AdjustmentTableLogic";
import ProfileSelectionLogic from "./ImportanceAdjustment/ProfileSelection/ProfileSelectionLogic";
import { Profile } from "../../types";

const COLORS = ['#41afaa', '#466eb4', '#aa998f', '#e6a532', '#d7642c', '#af4b91'];
const x_tick_amt : number = 0.1;
const x_tick : number[] = arrayRange(0,1,x_tick_amt);

/**
 * Returns an array of numbers between start and stop with step interval
 *
 * @param {number} start starting position.
 * @param {number} stop stopping position.
 * @param {number} step interval.
 *
 * @returns {array} An array of [start:step:stop].
 */
function arrayRange(start: number, stop : number, step : number){
  let foo =[];
  for(let i =start; i <= stop; i=i+step){
      let next = start+ i;
      foo.push(Number.parseFloat(next.toPrecision(2)));
  }
  return foo
}

/**
* Returns an array of numbers that graph a linear function
*
* @param {number} slope the slope of the function
* @param {number} step the value to increment each point by
* @param {number} x the x coord of a point on the line
* @param {number} y the y coord of a point on the line
*
* @returns {array} An array of y values on the line for every step.
*/
const calculateGraphedImpacts = (slope : number, step : number,  x : number, y : number) => {

  // y = mx + b
  // b = y - mx
  let y_int : number = y - (slope * x);

  let y_coords : number[] = [];
  for (let i : number = 0; i <= 1; i += step) {
    y_coords.push(slope * i + y_int);
  }

  return y_coords;
}

export const EnhancedImportanceAdjustment = () => {
  const [selectedProfile, setSelectedProfile] = useState<Profile | Profile[] | null>(null);
  const [recalculatedWeights, setRecalculatedWeights] = useState<{ [key: string]: number }>({});
  const [updatedValues, setUpdatedValues] = useState<{ [key: string]: number }>({});

  const handleProfileApply = (profile: Profile[] | null) => {
    setSelectedProfile(profile);
  };

  const isProfileApplied = selectedProfile !== null;

  const handleReset = () => {
    setSelectedProfile(null);
  };

  const handleWeightsChange = useCallback((weights: { [key: string]: number }) => {
    console.log('handle weights change');
    setRecalculatedWeights(weights);
  }, []);

  const handleValuesChange = useCallback((weights: { [key: string]: number }) => {
    console.log("handle values change");
    setUpdatedValues(weights);
  }, []);

  const updatedTQIRaw : number =
    recalculatedWeights &&
    Object.entries(recalculatedWeights).reduce(
      (total, [name, weight]) =>
        total + (updatedValues[name] || 0) * weight,
      0
    );

  const pieData = Object.entries(recalculatedWeights).map(([name, value]) => ({
    name,
    value,
  }));

  const chartData : ChartData[] = Object.entries(recalculatedWeights).map(([name, _value]) => ({
    name: name,
    value: updatedValues[name],
    importance: _value,
    impacts: calculateGraphedImpacts(_value, x_tick_amt, updatedValues[name], updatedTQIRaw) 
  }));

  return (
    <Flex direction="column" gap="3" align="start">
      <Box>
        <HoverCard.Root>
          <HoverCard.Trigger asChild>
            <Link href="#" size="3" style={{ margin: "0px" }}>
              <GearIcon /> Dynamic Importance Adjustment
            </Link>
          </HoverCard.Trigger>
          <HoverCard.Content>
            <Text as="div" size="1" style={{ maxWidth: 325 }}>
              For Quality Characteristics, <Strong>weights</Strong>, shown as
              numbers aligning on edges in the tree display, indicate the
              relative importance among the quality aspects in consideration.
              Since the industry requirements could be various, users are
              welcome to tune the weights by adjusting the corresponding
              importance to prioritize different characteristics.
            </Text>
          </HoverCard.Content>
        </HoverCard.Root>
      </Box>

      <Box>
        <Callout.Root>
          <Callout.Icon>
            <InfoCircledIcon />
          </Callout.Icon>
          <Callout.Text>
            Currently, the adjustment is only applicable for{" "}
            <Strong>Quality Characteristics</Strong>
            (i.e., the 2nd level of the tree display, and the 2nd expandable box
            in the list display).
          </Callout.Text>
        </Callout.Root>
      </Box>

      <Box>
        <Dialog.Root>
          <Dialog.Trigger asChild>
            <Button size="2" className="Button violet">
              Adjust
            </Button>
          </Dialog.Trigger>

          <Dialog.Portal>
            <Dialog.Overlay className="DialogOverlay" />
            <Dialog.Content
              className="DialogContent"
              style={{
                display: "grid",
                gridTemplateRows: "auto 1fr auto",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}
            >
              {/* Title block */}
              <Box style={{ gridColumn: "span 2" }}>
                <Dialog.Title className="DialogTitle">
                  Characteristics and corresponding weights
                </Dialog.Title>
                <Dialog.Description className="DialogDescription">
                  Adjust the importance of characteristics, the weights will be
                  recalculated automatically.
                </Dialog.Description>
              </Box>

              <Separator my="3" size="4" style={{ gridColumn: "span 2" }} />

              {/* Middle-left block: ProfileSelectionLogic and AdjustmentTableLogic */}
              <Box style={{ gridRow: "2", gridColumn: "1" }}>
                <ProfileSelectionLogic
                  onProfileChange={handleProfileApply}
                  selectedProfile={selectedProfile}
                />
                <Separator my="3" size="4" />
                <AdjustmentTableLogic
                  selectedProfile={
                    Array.isArray(selectedProfile) ? selectedProfile : undefined
                  }
                  isProfileApplied={isProfileApplied}
                  updatedTQIRaw={updatedTQIRaw}
                  onResetApplied={handleReset}
                  onWeightsChange={handleWeightsChange}
                  onValuesChange={handleValuesChange}
                />
              </Box>

              {/* Middle-right block: Tabs */}
              <Box style={{ gridRow: "2", gridColumn: "2" }}>
                <Tabs.Root defaultValue="contribution">
                  <Tabs.List style={{ marginTop: "50px" }}>
                    <Tabs.Trigger value="contribution">Contribution</Tabs.Trigger>
                    <Tabs.Trigger value="sensitivity">Sensitivity</Tabs.Trigger>
                  </Tabs.List>
                  <Tabs.Content value="contribution">
                    {/* Pie Chart for Contribution */}
                    <Box style={{ padding: "16px", border: "1px dashed #ccc" }}>
                      {Pie_Chart(pieData)}
                    </Box>
                  </Tabs.Content>
                  <Tabs.Content value="sensitivity">
                    {/* Placeholder for Sensitivity content */}
                    {<Box style={{ padding: "16px", border: "1px dashed #ccc" }}>
                      {SensitivityChart(chartData, updatedTQIRaw, x_tick, 1.0)}
                    </Box>}
                  </Tabs.Content>
                </Tabs.Root>
              </Box>

              {/* Bottom block: Strategies */}
              {/*<Box
                style={{
                  gridColumn: "span 2",
                  padding: "16px",
                  border: "1px dashed #ccc",
                }}
              >
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart
                    data={lineChartData}
                    margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="value" label={{ value: 'Characteristic Value', position: 'insideBottom', offset: -5 }} />
                    <YAxis label={{ value: 'Adjusted Weight', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    {lineChartData.map((entry, index) => (
                      <Line
                        type="monotone"
                        dataKey="weight"
                        data={lineChartData.filter((d) => d.characteristic === entry.characteristic)}
                        stroke={COLORS[index % COLORS.length]}
                        key={index}
                        name={entry.characteristic}
                        dot={{ r: 5 }}
                        activeDot={{ r: 8 }}
                      />
                    ))}
                    <Line
                      type="monotone"
                      dataKey="weight"
                      data={lineChartData.map((d) => ({ characteristic: d.characteristic, value: d.value, weight: 1 }))}
                      stroke="red"
                      strokeDasharray="5 5"
                      name="Threshold"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>*/}

              <Dialog.Close asChild>
                <IconButton className="IconButton" aria-label="Close">
                  <Cross2Icon />
                </IconButton>
              </Dialog.Close>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </Box>
    </Flex>
  );
};