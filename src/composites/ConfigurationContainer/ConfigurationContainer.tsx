import { useAtomValue } from "jotai";
import { State } from "../../state";
import { Flex, Text, Box, Strong } from "@radix-ui/themes";
import * as Tabs from "@radix-ui/react-tabs";
import { ConfigurationSummary } from "./Summary";
import { ImportanceAdjustment } from "./ImportanceAdjustment";
import { NodeValueAdjustment } from "./NodeValueAdjustment";
import { EnhancedImportanceAdjustment } from "./EnhancedImportanceAdjustment";
import "../Style/Separator.css";
import "../Style/ConfigTab.css";

export const ConfigurationContainer = () => {
  return (
    // Change Flex direction to 'column' for vertical layout
    <Flex direction={"column"} gap={"3"} align={"start"}>
      <Flex>
        <Tabs.Root className="ConfigTab--TabsRoot" defaultValue="summary">
          <Tabs.List className="ConfigTab--TabsList">
            <Tabs.Trigger className="ConfigTab--TabsTrigger" value="summary">
              Summary
            </Tabs.Trigger>
            <Tabs.Trigger className="ConfigTab--TabsTrigger" value="importance">
              Importance Adjustment
            </Tabs.Trigger>
            <Tabs.Trigger className="ConfigTab--TabsTrigger" value="enhancedimportance">
              Importance Adjustment(Enhanced)
            </Tabs.Trigger>
            {/* <Tabs.Trigger className="ConfigTab--TabsTrigger" value="value">
              <Strong>(In Progress)</Strong> Value Adjustment
            </Tabs.Trigger> */}
          </Tabs.List>

          <Flex>
            {/* Current Configuration Summary */}
            <Tabs.Content className="ConfigTab--TabsContent" value="summary">
              <Box width="100%">
                <ConfigurationSummary />
              </Box>
            </Tabs.Content>

            {/* dynamic importance adjustment */}
            <Tabs.Content className="ConfigTab--TabsContent" value="importance">
              <Box width="100%">
                <ImportanceAdjustment />
              </Box>
            </Tabs.Content>

            {/* enhanced dynamic importance adjustment */}
            <Tabs.Content className="ConfigTab--TabsContent" value="enhancedimportance">
              <Box width="100%">
                <EnhancedImportanceAdjustment />
              </Box>
            </Tabs.Content>

            {/* dynamic value adjustment */}
            <Tabs.Content className="ConfigTab--TabsContent" value="value">
              <Box width="100%">
                <NodeValueAdjustment />
              </Box>
            </Tabs.Content>
          </Flex>
        </Tabs.Root>
      </Flex>
    </Flex>
  );
};
