// AdjustmentTableUI.tsx
import React, { useState } from "react";
import {
  Flex,
  Text,
  HoverCard,
  Link,
  Strong,
  Table,
  Box,
  Card,
  Avatar,
  Button,
} from "@radix-ui/themes";
import {
  ResetIcon,
  DownloadIcon,
  InfoCircledIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  DashIcon,
  MagicWandIcon,
} from "@radix-ui/react-icons";
import SingleTableRow from "./SingleRowInTable";
import * as schema from "../../../../data/schema";
import { useAtom } from "jotai";
import { State } from "../../../../state";


// added for multiple sliders
export enum SliderMode {
  importance,
  characteristics,
}

interface AdjustmentTableUIProps {
  dataset: schema.base.Schema;
  characteristicValues: { [key: string]: number };
  importanceValues: { [key: string]: number };
  recalculatedWeights: { [key: string]: number };
  updatedTQIRaw : number;
  handleSliderChange: (name: string, newImportance: number, mode : SliderMode) => void;
  resetAllAdjustments: () => void;
  handleDownload: () => void;
}

export const AdjustmentTableUI: React.FC<AdjustmentTableUIProps> = ({
  dataset,
  characteristicValues,
  importanceValues,
  recalculatedWeights,
  updatedTQIRaw,
  handleSliderChange,
  resetAllAdjustments,
  handleDownload,
}) => {
  const precision = 4;
  const currentTQI =
    parseFloat(
      Object.values(dataset.factors.tqi)[0]?.value.toFixed(precision)
    ) || 0;
  /*const updatedTQIRaw : number =
    recalculatedWeights &&
    Object.entries(recalculatedWeights).reduce(
      (total, [name, weight]) =>
        total + (characteristicValues[name] || 0) * weight,
      0
    );*/

  // Ensure updatedTQI is formatted to the same precision
  const updatedTQI = updatedTQIRaw
    ? parseFloat(updatedTQIRaw.toFixed(precision))
    : 0;

  // to apply the customized importance
  const [_, setTqiValue] = useAtom(State.tqiValue);
  const [__, setAdjustedImportance] = useAtom(State.adjustedImportance);
  const [___, setAdjustedCharacteristic] = useState(dataset.factors.quality_aspects);

  const handleApply = () => {
    console.log('dataset factors: ', dataset.factors);
    setTqiValue(updatedTQI); // Set tqiValue as updatedTQI
    setAdjustedImportance(recalculatedWeights); // Set adjustedImportance as recalculatedWeights

    // update each QA char value
    let updatedQA : any = dataset.factors.quality_aspects;
    updatedQA.map((e : any) => {
      e.value = characteristicValues[e.name];
    });

    setAdjustedCharacteristic(updatedQA);
  };

  return (
    <Flex direction={"column"} align={"center"}>
      <Box>
        <Table.Root variant="surface" style={{ width: "100%" }}>
          <Table.Header>
            <Table.Row align={"center"}>
              <Table.ColumnHeaderCell justify={"center"} width={"16%"}>
                <Text>Characteristics </Text>
                <HoverCard.Root>
                  <HoverCard.Trigger>
                    <Link href="#">
                      <InfoCircledIcon />
                    </Link>
                  </HoverCard.Trigger>
                  <HoverCard.Content>
                    <Text as="div" style={{ maxWidth: 325 }}>
                      These are the Quality Characteristics that have impacts
                      towards the TQI (Total Quality Index).
                    </Text>
                  </HoverCard.Content>
                </HoverCard.Root>
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell justify={"center"} width={"10%"}>
                Original Value
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell justify={"center"} width={"22%"}>
                Characteristic Adjustment Sliders
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell justify={"center"} width={"10%"}>
                Original Weight
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell justify={"center"} width={"22%"}>
                <Text>Importance Adjustment Sliders </Text>
                <HoverCard.Root>
                  <HoverCard.Trigger>
                    <Link href="#">
                      <InfoCircledIcon />
                    </Link>
                  </HoverCard.Trigger>
                  <HoverCard.Content>
                    <Text as="div" style={{ maxWidth: 325 }}>
                      Please drag the thumb on the slider to adjust the
                      importance. The next column{" "}
                      <Strong>Adjusted Weight</Strong> renders the updated
                      weight values based on the adjusted importance. The{" "}
                      <Strong>Updated TQI</Strong> is updated while adjustment
                      immediately.
                    </Text>
                  </HoverCard.Content>
                </HoverCard.Root>
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell justify={"center"} width={"10%"}>
                Adjusted Weight
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell justify={"center"} width={"10%"}>
                Impact
              </Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {Object.entries(dataset.factors.tqi).map(([_, tqiEntry]) => {
              return Object.entries(tqiEntry.weights).map(([name, weight]) => {
                return (
                  <SingleTableRow
                    key={name}
                    name={name}
                    //qualityAspectValue={
                      //dataset.factors.quality_aspects[name]?.value || 0
                    //}
                    qualityAspectDescription={
                      dataset.factors.quality_aspects[name]?.description || ""
                    }
                    
                    characteristicValue={tqiEntry.value}
                    characteristicSlider={characteristicValues[name]}

                    weightValue={weight}
                    importanceSlider={importanceValues[name]}
                    recalculatedWeight={recalculatedWeights[name]}
                    onSliderChange={handleSliderChange}
                  />
                );
              });
            })}
          </Table.Body>
        </Table.Root>
      </Box>

      <Flex
        direction={"row"}
        align={"center"}
        justify="center"
        style={{ width: "100%" }}
      >
        <Box style={{ flexBasis: "37.5%" }}>
          <Card size="1">
            <Flex gap="3" align="center">
              <Avatar size="3" radius="full" fallback="Ini" color="indigo" />
              <Box>
                <Text as="div" size="2" weight="bold" color = "gray">
                  Initial TQI
                </Text>
                <Text as="div" size="2" color="gray">
                  {currentTQI.toFixed(4)}
                </Text>
              </Box>
            </Flex>
          </Card>
        </Box>
        <Box style={{ flexBasis: "37.5%" }}>
          <Card size="1">
            <Flex gap="3" align="center">
              <Avatar size="3" radius="full" fallback="New" color="indigo" />
              <Box>
                <Text as="div" size="2" weight="bold" color = "gray">
                  Updated TQI
                </Text>
                <Flex gap="2" align="center">
                  <Text as="div" size="2" color="gray">
                    {updatedTQI.toFixed(4)}
                  </Text>
                  {updatedTQI > currentTQI ? (
                    <ArrowUpIcon style={{ color: "green" }} />
                  ) : updatedTQI < currentTQI ? (
                    <ArrowDownIcon style={{ color: "red" }} />
                  ) : (
                    <DashIcon style={{ color: "gray" }} />
                  )}
                </Flex>
              </Box>
            </Flex>
          </Card>
        </Box>
      </Flex>

      <Flex
        direction={"row"}
        align={"center"}
        justify="center"
        style={{ width: "100%" }}
      >
        <Box style={{ flexBasis: "25%" }}>
          <Button
            variant="outline"
            onClick={handleApply}
            style={{ width: "100%", height: "30px" }}
            color = "gray"
          >
            <MagicWandIcon width="16" height="16" />
            Apply
          </Button>
        </Box>
        <Box style={{ flexBasis: "25%" }}>
          <Button
            variant="surface"
            onClick={resetAllAdjustments}
            style={{ width: "100%", height: "30px" }}
            color = "gray"
          >
            <ResetIcon width="16" height="16" />
            Reset
          </Button>
        </Box>
        <Box style={{ flexBasis: "25%" }}>
          <Button
            variant={"surface"}
            onClick={handleDownload}
            style={{ width: "100%", height: "30px" }}
            color = "gray"
          >
            <DownloadIcon width="16" height="16"/>
            Download
          </Button>
        </Box>
      </Flex>
    </Flex>
  );
};

export default AdjustmentTableUI;
