import { useAtom, useAtomValue } from "jotai";
import { State } from "../../state";
import { Badge, Flex, Text, Strong } from "@radix-ui/themes";



export const LegendContainer = () => {
  return (

    <Flex gap="2" align='center'>
      <Text weight="bold" as="div" color="gray" size="5"> <Strong>Risk Level   </Strong></Text>
      <Badge style={{ backgroundColor: "#DC267F" }} size="2">Severe</Badge>
      <Badge style={{ backgroundColor: "#FE6100" }} size="2">High</Badge>
      <Badge style={{ backgroundColor: "#FFB000" }} size="2">Medium</Badge>
      <Badge style={{ backgroundColor: "#785EF0" }} size="2">Low</Badge>
      <Badge style={{ backgroundColor: "#648FFF" }} size="2">Insignificant</Badge>
    </Flex>

  );
};