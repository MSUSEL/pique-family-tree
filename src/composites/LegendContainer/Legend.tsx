import { Badge, Flex, Text, Strong } from "@radix-ui/themes";
import "./legend.css";

export const LegendContainer = () => {

  return (

    <Flex gap="2" align='center'>
      <Text weight="bold" as="div" color="gray" size="5"> <Strong>Risk Level</Strong></Text>
      <Badge id="severe" size="2">Severe</Badge>
      <Badge id="high" size="2">High</Badge>
      <Badge id="medium" size="2">Medium</Badge>
      <Badge id="low" size="2">Low</Badge>
      <Badge id="insignificant" size="2">Insignificant</Badge>
    </Flex>

  );
};