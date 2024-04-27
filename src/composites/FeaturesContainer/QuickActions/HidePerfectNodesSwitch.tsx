import { useAtom } from "jotai";
import { State } from "../../../state";
import { Switch, Flex, Text } from "@radix-ui/themes";

export const HidePerfectNodesSwitch = () => {
   
    const [hideOneValueNodeState, setHideOneValueNodeState] = useAtom(State.hideOneValueNodeState);
    const handleToggle = () => {
        setHideOneValueNodeState(hideOneValueNodeState === "not-hidding" ? "hidding" : "not-hidding");
    };

    console.log("Current Weight=0 Edges State:", hideOneValueNodeState);

    return (
        <Flex gap="3" align="center">
            <Text as="label" size="2">
                <Flex gap="2">
                    <Switch checked={hideOneValueNodeState === "hidding"} onCheckedChange={handleToggle} />
                    (In progress) Hide Value = 1 Nodes
                </Flex>
            </Text>
        </Flex>
    );
};

