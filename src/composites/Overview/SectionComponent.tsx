import {
  Flex,
  Text,
  Box,
  Button,
  Link,
  Badge,
  Strong,
  ScrollArea,
  Dialog,
  Separator,
} from "@radix-ui/themes";
import { CircleIcon, CheckCircledIcon } from "@radix-ui/react-icons";
import { PieChart, Pie, Tooltip, Cell } from "recharts";
import "./Overview.css";
import "@radix-ui/colors/mauve.css";
import LevelAccordion from "./LevelAccordion";
import { useState } from "react";
import { State } from "../../state";
import { useAtomValue } from "jotai";
import { useProcessedData } from "../../data/useProcessedData";
import React from "react";
import "@radix-ui/colors/violet.css";

interface FilterableItem {
  name: string;
  value: number;
  description: string;
  weights?: Record<string, number>;
}

interface ChartDataItem {
  name: string;
  Count: number;
}

interface Impact {
  aspectName: string;
  weight: number;
}

interface TopProblematicItem {
  name: string;
  details: FilterableItem;
  weight?: number;
  impacts?: Impact[];
}

interface SectionComponentProps {
  title: string;
  nestedObj: Record<string, FilterableItem>;
  chartData: ChartDataItem[];
  colors: Record<string, string>;
  topProblematicItems: TopProblematicItem[];
  isDiagnostics?: boolean;
}

const SectionComponent: React.FC<SectionComponentProps> = ({
  title,
  nestedObj,
  chartData,
  colors,
  topProblematicItems,
  isDiagnostics = false,
}) => {
  const dataset = useAtomValue(State.dataset);
  const processedData = useProcessedData();

  const [detailsVisible, setDetailsVisible] = useState(false); // State to track visibility

  const toggleDetailsVisibility = () => {
    setDetailsVisible((prevState) => !prevState); // Toggle visibility
  };

  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    {}
  );

  const toggleItem = (key: string) => {
    setExpandedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Flex direction={"row"} style={{ width: "100%" }} justify="between">
      {/* Accordion section */}
      <Flex
        direction={"column"}
        align={"center"}
        justify={"center"}
        gap={"5"}
        style={{ flexBasis: "30%" }}
      >
        <Box>
          <Badge size="2">{title}</Badge>
        </Box>
        <Box
          className="toggle-button-container"
          style={{ background: "white" }}
        >
          <Button
            className="toggle-button"
            onClick={toggleDetailsVisibility}
            style={{
              right: "0",
              fontSize: "85%",
              color: "gray",
            }}
          >
            View Additional Details
            {detailsVisible ? (
              <CheckCircledIcon className="chevron-icon" />
            ) : (
              <CircleIcon className="chevron-icon" />
            )}
          </Button>
        </Box>
        <Box>
          <ScrollArea style={{ height: "38vh" }}>
            <LevelAccordion
              nestedobj={nestedObj}
              isDiagnostics={isDiagnostics}
              detailsVisible={detailsVisible}
            />
          </ScrollArea>
        </Box>
      </Flex>

      {/* Pie chart section */}
      <Flex
        direction={"column"}
        align={"center"}
        justify={"center"}
        gap={"5"}
        style={{ flexBasis: "30%" }}
      >
        <Box>
          <PieChart width={300} height={300}>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              dataKey="Count"
              label
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[entry.name]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </Box>
      </Flex>

      {/* Top problematic items section */}
      <Flex
        direction={"column"}
        align={"center"}
        justify={"center"}
        gap={"5"}
        style={{ flexBasis: "30%" }}
      >
        <Box>
          <Text style={{ color: "var(--violet-11)" }}>Lowest 3 Scores:</Text>
        </Box>
        <Box>
          <Flex direction="column" gap="7" align="start">
            {topProblematicItems.map((item, index) => (
              <Dialog.Root key={index}>
                <Dialog.Trigger>
                  <Button style={{ background: "none" }}>
                    <Text as="p">
                      <Flex direction={"column"} align={"start"}>
                        <Link href="#" style={{ color: "var(--violet-11)" }}>
                          {item.name}:{" "}
                          <Strong
                            style={{
                              fontSize: "1.3em",
                            }}
                          >
                            <Text as="p" style={{ color: "var(--violet-11)" }}>
                              {item.details.value.toFixed(2)}
                            </Text>{" "}
                          </Strong>
                        </Link>
                      </Flex>
                    </Text>
                  </Button>
                </Dialog.Trigger>
                <Dialog.Content>
                  <Text
                    as="div"
                    size="1"
                    style={{ maxWidth: 250, color: "var(--violet-11)" }}
                  >
                    {item.impacts && item.impacts.length > 0 ? (
                      item.impacts.map((impact, impactIndex) => (
                        <Text
                          as="p"
                          key={impactIndex}
                          style={{ color: "var(--violet-11)" }}
                        >
                          <Strong>Item name: </Strong> {item.name}
                          <Separator my="3" size="4" />
                          <Strong>Impact to {impact.aspectName}:</Strong>{" "}
                          {impact.weight.toFixed(3)}
                        </Text>
                      ))
                    ) : item.weight !== undefined ? (
                      <Text as="p" style={{ color: "var(--violet-11)" }}>
                        <Strong>Item name: </Strong> {item.name}
                        <Separator my="3" size="4" />
                        <Strong>Impact to TQI:</Strong> {item.weight.toFixed(3)}
                      </Text>
                    ) : null}

                    <Text as="p">
                      <Strong>Description:</Strong>{" "}
                      {item.details.description || "Not Provided"}
                    </Text>
                  </Text>
                </Dialog.Content>
              </Dialog.Root>
            ))}
          </Flex>
        </Box>
      </Flex>
    </Flex>
  );
};

export default SectionComponent;
