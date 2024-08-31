import { useState, useEffect } from "react";
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
import "../Style/Dialog.css";
import {ChartData, TabWindow} from "./ImportanceAdjustment/PlotPanel/PlotPanel.tsx";
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
  const [updatedValues, setUpdatedValues] = useState<{ [key: string]: number }>({}); // characteristic value
  const [updatedImportance, setUpdatedImportance] = useState<{ [key: string]: number }>({}); // importance value

  // the numbers that appear in the strategies/impact lists
  const [strategyValues, setStrategyValues] = useState<{ [key: string]: number }>({});
  const [strategy, setStrategy] = useState("Lowest");

  /*useEffect(() => {
    console.log('Updated strategy values: ', strategyValues);
  }, [strategyValues]);*/
  useEffect(() => {
    handleStrategyChanged();
    console.log('Updated strategy: ', strategy);
  }, [strategy, updatedImportance, updatedValues, recalculatedWeights]);

  useEffect(() => {
    console.log('Updated importance values: ', updatedImportance);
  }, [updatedImportance]);

  const handleStrategyChanged = () => {

    if (strategy == 'Lowest'){ // by characteristic value, highest to lowest

      let sortedValues = Object.fromEntries(
        Object.entries(updatedValues).sort(([, a], [, b]) => a - b)
      );  
      setStrategyValues(sortedValues);
    }
    else if (strategy == 'Fastest'){ // by importance value, highest to lowest

      let sortedValues = Object.fromEntries(
        Object.entries(updatedImportance).sort(([, a], [, b]) => b - a)
      );  
      setStrategyValues(sortedValues);
    }
    else if (strategy === 'LowestEffort'){ // by (1 - importance) * char value, highest to lowest

      const lowestEffortArray = Object.entries(updatedImportance).map(([name, value]) => ({
        name, 
        value: (1 - updatedValues[name]) * value,
      }));

      lowestEffortArray.sort((a, b) => b.value - a.value);
  
      const lowestEffort = Object.fromEntries(
        lowestEffortArray.map(item => [item.name, item.value])
      );
      setStrategyValues(lowestEffort);
    }
    else { // by characteristic value, lowest to highest

      let sortedValues = Object.fromEntries(
        Object.entries(updatedValues).sort(([, a], [, b]) => b - a)
      );  
      setStrategyValues(sortedValues);
    }
  };

  const handleProfileApply = (profile: Profile[] | null) => {
    setSelectedProfile(profile);
  };

  const isProfileApplied = selectedProfile !== null;

  const handleReset = () => {
    setSelectedProfile(null);
  };

  const updatedTQIRaw : number =
    recalculatedWeights &&
    Object.entries(recalculatedWeights).reduce(
      (total, [name, weight]) =>
        total + (updatedValues[name] || 0) * weight,
      0
    );

  const pieData = Object.entries(recalculatedWeights).map(([name, value]) => ({
    name, 
    value: value * updatedValues[name] / updatedTQIRaw, // value * importance / total score
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
                gridTemplateColumns: "60% 40%",
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
                  onWeightsChange={setRecalculatedWeights}
                  onImportanceChange={setUpdatedImportance}
                  onValuesChange={setUpdatedValues}
                />
              </Box>

              {/* Middle-right block: Tabs */}
              

              <Box style={{ gridRow: "2", gridColumn: "2" }}>      
                {TabWindow(pieData, chartData, updatedTQIRaw, x_tick, 1.0, strategy, setStrategy, strategyValues)}
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