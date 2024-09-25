
import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDownIcon, ChevronUpIcon } from "@radix-ui/react-icons";
import {
  getNormalColorBasedOnValue,
  getDiagnosticColorBasedOnValue,
} from "../LegendContainer/GetColorVasedOnValue";
import { useColorMode } from '../../color-mode.tsx';
import { normalPalette, colorBlindPalette } from "../../colors.ts";
import { renderSignleObjectDetails } from "./RenderSignleObjectDetails";
import "../Style/ListDisplay.css";

export const renderDetails = (
    Data: { [key: string]: any },
    toggleItemFn: (key: string) => void,
    expandedState: Record<string, boolean>,
    isDiagnosticData: boolean = false
  ) => {
    const { isColorBlind, toggleColorMode } = useColorMode();
    const palette = isColorBlind ? colorBlindPalette : normalPalette;

    const getColor = isDiagnosticData
      ? getDiagnosticColorBasedOnValue
      : getNormalColorBasedOnValue;
    return (
      <Accordion.Root type="multiple" className="ListDisplay__AccordionRoot">
        {Object.entries(Data).map(([key, value]) => {
          const isExpanded = expandedState[key] || false;
          const backgroundColor = getColor(value.value, palette);

          return (
            <Accordion.Item
              key={key}
              value={key}
              className="ListDisplay__AccordionItem"
            >
              <Accordion.Header className="ListDisplay__AccordionHeader">
                <Accordion.Trigger
                  className="ListDisplay__AccordionTrigger"
                  onClick={() => toggleItemFn(key)}
                  style={{ backgroundColor }}
                >
                  {value.name ?? "N/A"}: {value.value.toFixed(2) ?? "N/A"}
                  {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content className="ListDisplay__AccordionContent">
                {isExpanded && renderSignleObjectDetails(value)}
              </Accordion.Content>
            </Accordion.Item>
          );
        })}
      </Accordion.Root>
    );
  };

export  const renderMeasuresDetails = (
    measuresData: { [key: string]: any },
    toggleItemFn: (key: string) => void,
    expandedState: Record<string, boolean>,
    isDiagnosticData: boolean = false
  ) => {
    const { isColorBlind, toggleColorMode } = useColorMode();
    const palette = isColorBlind ? colorBlindPalette : normalPalette;
    const getColor = isDiagnosticData
      ? getDiagnosticColorBasedOnValue
      : getNormalColorBasedOnValue;
    return (
      <Accordion.Root type="multiple" className="ListDisplay__AccordionRoot">
        {Object.entries(measuresData).map(([key, measure]) => {
          const isExpanded = expandedState[key] || false;

          // Use the key as a fallback if the name property is missing
          const measureName = measure.name ?? key;
          const measureValue = measure.value ?? "N/A";
          const backgroundColor = getColor(measureValue, palette);

          return (
            <Accordion.Item
              key={key}
              value={key}
              className="ListDisplay__AccordionItem"
            >
              <Accordion.Header className="ListDisplay__AccordionHeader">
                <Accordion.Trigger
                  className="ListDisplay__AccordionTrigger"
                  onClick={() => toggleItemFn(key)}
                  style={{ backgroundColor }}
                >
                  {measureName}: {measureValue.toFixed(2) ?? "N/A"}
                  {isExpanded ? <ChevronDownIcon /> : <ChevronDownIcon />}
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content className="ListDisplay__AccordionContent">
                {isExpanded && renderSignleObjectDetails(measure)}
              </Accordion.Content>
            </Accordion.Item>
          );
        })}
      </Accordion.Root>
    );
  };