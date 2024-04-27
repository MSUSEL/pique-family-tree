import { useAtom } from "jotai";
import { State } from "../../../state";
import { Switch, Flex, Text } from "@radix-ui/themes";

export const HideZeroWeightsSwitch = () => {
   
    const [hideZeroWeightEdgeState, setHideZeroWeightEdgeState] = useAtom(State.hideZeroWeightEdgeState);
    const handleToggle = () => {
        setHideZeroWeightEdgeState(hideZeroWeightEdgeState === "not-hidding" ? "hidding" : "not-hidding");
    };

    console.log("Current Weight=0 Edges State:", hideZeroWeightEdgeState);

    return (
        <Flex gap="3" align="center">
            <Text as="label" size="2">
                <Flex gap="2">
                    <Switch checked={hideZeroWeightEdgeState === "hidding"} onCheckedChange={handleToggle} />
                    Hide Weight = 0 Edges 
                </Flex>
            </Text>
        </Flex>
    );
};
