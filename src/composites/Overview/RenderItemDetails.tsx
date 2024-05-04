import { Table } from "@radix-ui/themes";
import * as Accordion from "@radix-ui/react-accordion";
import { renderObjectDetails } from "./LevelAccordion";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { FilterableItem } from "./LevelAccordion";

// Renders the information for a single item
export const renderItemDetails = (
  key: string,
  details: FilterableItem,
  detailsVisible: boolean
) => {
  return (
    <Accordion.Item value={key} key={key} className="Level--AccordionLevel">
      <Accordion.Header className="Level--AccordionHeader">
        <Accordion.Trigger className="Level--AccordionTrigger">
          {details.name}: {details.value.toFixed(2)}
          <ChevronDownIcon className="Level--AccordionChevron" />
        </Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Content className="Level--AccordionContent">
        <Table.Root>
          <Table.Body>
            <Table.Row>
              {
                <Table.Cell className="Level--AccordionContentText">
                  <strong>Description: </strong>
                  {details.description || "Not Provided"}
                </Table.Cell>
              }
            </Table.Row>
            <Table.Row className="AdditionalDetails">
              {/* Renders additional information if detailsVisible is true */}
              {detailsVisible && renderObjectDetails(details)}
            </Table.Row>
          </Table.Body>
        </Table.Root>
      </Accordion.Content>
    </Accordion.Item>
  );
};

export default renderItemDetails;
