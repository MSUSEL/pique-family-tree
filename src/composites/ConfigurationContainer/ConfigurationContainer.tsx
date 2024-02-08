import { useAtomValue } from "jotai";
import { State } from "../../state";
import { Flex, Text, Box, Strong } from "@radix-ui/themes";
import * as Tabs from '@radix-ui/react-tabs';
import { ConfigurationSummary } from "./Summary";
import { DynamicWeightsButton } from "./DynamicWeightsAdjustSettingWindow";
import { ImportanceAdjustment } from "./ImportanceAdjustment";
import { NodeValueAdjustment } from "./NodeValueAdjustment";
import "../Style/Separator.css"
import "../Style/Tab.css"

export const ConfigurationContainer = () => {

    return (
        // Change Flex direction to 'column' for vertical layout
        <Flex direction={'column'} gap={'3'} align={'start'}>

       

            <Flex>
                <Tabs.Root className="TabsRoot" defaultValue="summary">
                    <Tabs.List className="TabsList">
                        <Tabs.Trigger className="TabsTrigger" value="summary">Summary</Tabs.Trigger>
                        <Tabs.Trigger className="TabsTrigger" value="importance" >Importance Adjustment</Tabs.Trigger>
                        <Tabs.Trigger className="TabsTrigger" value="value" >Value Adjustment</Tabs.Trigger>
                    </Tabs.List>

                    <Flex>

                        {/* Current Configuration Summary */}
                        <Tabs.Content className="TabsContent" value="summary">
                            <Box width="100%">
                                <ConfigurationSummary />
                            </Box>
                        </Tabs.Content>

                        {/* dynamic importance adjustment */}
                        <Tabs.Content className="TabsContent" value="importance">
                            <Box width="100%">
                                <ImportanceAdjustment />
                            </Box>
                        </Tabs.Content>

                        {/* dynamic value adjustment */}
                        <Tabs.Content className="TabsContent" value="value">
                            <Box width="100%">
                                <NodeValueAdjustment />
                            </Box>
                        </Tabs.Content>
                    </Flex>
                </Tabs.Root>
            </Flex>
        </Flex >
    );
};