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
import { useState,useEffect } from "react";
import React from "react";
import "@radix-ui/colors/violet.css";
import { renderObjectDetails } from "./LevelAccordion";

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
  propSelectedItem: any;
}

// Wrapper for each 'section' which contains accordion, pie
//  chart, and top 3 list based on data type (characteristic, factor, etc.)
const SectionComponent: React.FC<SectionComponentProps> = ({
  title,
  nestedObj,
  chartData,
  colors,
  topProblematicItems,
  isDiagnostics = false,
  propSelectedItem,
  
}) => {
  const [detailsVisible, setDetailsVisible] = useState(false); // State to track visibility
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    console.log("SectionComponent - propSelectedItem:", propSelectedItem);
  }, [propSelectedItem]);

  const toggleDetailsVisibility = () => {
    setDetailsVisible((prevState) => !prevState); // Toggle visibility
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
    console.log("Selected Item:", item);
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
        <Box className="toggle-button-container">
          {/* Toggles additional details for all items in this section */}
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
             selectedItem={selectedItem}
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
            {/* Renders the top 3 list's information and popup windows */}
            {topProblematicItems.map((item, index) => (
              <Dialog.Root key={index}>
                <Dialog.Trigger>
                  {/* Buttons containing item name, score, and trigger for popup window */}
                  <Button style={{ background: "none" }} onClick={() => handleItemClick(item)}>
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
                {/* Content in popup window, should eventually match the accordion element, targeted on given item */}
                <Dialog.Content>
  <Text as="div" size="2" style={{ color: "var(--violet-11)" }}>
    {/* Render impacts or weight */}
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

    {/* Description */}
    <Text as="p">
      <Strong>Description:</Strong>{" "}
      {item.details.description || "Not Provided"}
    </Text>

    {/* Additional details */}
    {renderObjectDetails(item.details)}
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
