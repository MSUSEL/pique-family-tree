import { useAtomValue } from "jotai";
import { State } from "../../state";
import { useState } from "react";

import { Text } from "@radix-ui/themes";
import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDownIcon } from "@radix-ui/react-icons";

import { useProcessedData } from "../../data/useProcessedData";
import { renderDetails, renderMeasuresDetails } from "./RenderDetails";

import "../Style/ListDisplay.css";

export const ListDisplay = () => {
  // get dataset and processed dataset
  const dataset = useAtomValue(State.dataset);
  const processedData = useProcessedData();

  //console.log(State.hideZeroWeightEdgeState);

  // State to manage the expanded state of accordion items
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    {}
  );

  const toggleItem = (key: string) => {
    setExpandedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (!processedData) {
    return <div>Loading data...</div>;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Title */}
      <Text weight="medium" align="center" size="6" as="div" style={{color: "#444140"}}>
        {dataset?.name}
      </Text>

      {/* Accordion for different data levels */}
      <Accordion.Root type="multiple" className="ListDisplay__AccordionRoot">
        {/* 1st level: tqi */}
        <Accordion.Item value="tqi" className="ListDisplay__AccordionItem">
          <Accordion.Header>
            <Accordion.Trigger className="ListDisplay__AccordionTrigger">
              TQI
              <ChevronDownIcon
                className="ListDisplay__AccordionChevron"
                aria-hidden
              />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content>
            {processedData?.factors?.tqi &&
              renderDetails(
                processedData.factors.tqi,
                toggleItem,
                expandedItems,
                false
              )}
          </Accordion.Content>
        </Accordion.Item>

        {/* 2nd level: quality_aspects */}
        <Accordion.Item
          value="quality_aspects"
          className="ListDisplay__AccordionItem"
        >
          <Accordion.Header>
            <Accordion.Trigger className="ListDisplay__AccordionTrigger">
              {
                Object.keys(processedData?.factors?.quality_aspects || {})
                  .length
              }{" "}
              Characteristics
              <ChevronDownIcon
                className="ListDisplay__AccordionChevron"
                aria-hidden
              />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content>
            {processedData?.factors?.quality_aspects &&
              renderDetails(
                processedData.factors.quality_aspects,
                toggleItem,
                expandedItems,
                false
              )}
          </Accordion.Content>
        </Accordion.Item>

        {/* 3rd level: product_factors */}
        <Accordion.Item
          value="product_factors"
          className="ListDisplay__AccordionItem"
        >
          <Accordion.Header>
            <Accordion.Trigger className="ListDisplay__AccordionTrigger">
              {
                Object.keys(processedData?.factors?.product_factors || {})
                  .length
              }{" "}
              Factors
              <ChevronDownIcon
                className="ListDisplay__AccordionChevron"
                aria-hidden
              />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content>
            {processedData?.factors?.product_factors &&
              renderDetails(
                processedData.factors.product_factors,
                toggleItem,
                expandedItems,
                false
              )}
          </Accordion.Content>
        </Accordion.Item>

        {/* 4th level: measures */}
        <Accordion.Item value="measures" className="ListDisplay__AccordionItem">
          <Accordion.Header>
            <Accordion.Trigger className="ListDisplay__AccordionTrigger">
              {Object.keys(processedData?.measures || {}).length} Measures
              <ChevronDownIcon
                className="ListDisplay__AccordionChevron"
                aria-hidden
              />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content>
            {processedData?.measures &&
              renderMeasuresDetails(
                processedData.measures,
                toggleItem,
                expandedItems,
                false
              )}
          </Accordion.Content>
        </Accordion.Item>

        {/* 5th level: diagnostics */}
        <Accordion.Item
          value="diagnostics"
          className="ListDisplay__AccordionItem"
        >
          <Accordion.Header>
            <Accordion.Trigger className="ListDisplay__AccordionTrigger">
              {Object.keys(processedData?.diagnostics || {}).length} Diagnostics
              <ChevronDownIcon
                className="ListDisplay__AccordionChevron"
                aria-hidden
              />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content>
            {processedData?.diagnostics &&
              renderDetails(
                processedData.diagnostics,
                toggleItem,
                expandedItems,
                true
              )}
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
    </div>
  );
};
