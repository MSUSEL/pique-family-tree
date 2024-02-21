import {
  Flex,
  Text,
  Box,
  Button,
  Avatar,
  HoverCard,
  Link,
  Separator,
  Badge,
  Strong,
} from "@radix-ui/themes";
import { PieChart, Pie, Tooltip, Cell } from "recharts";
import "./Overview.css";
import "@radix-ui/colors/mauve.css";
import LevelAccordion from "./LevelAccordion";

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

interface SectionComponentProps {
  title: string;
  nestedObj: Record<string, FilterableItem>; // Adjust if your structure is different
  chartData: ChartDataItem[];
  colors: Record<string, string>; // Mapping from item name to color
  topProblematicItems: {
    name: string;
    details: FilterableItem;
    weight?: number; // Optional if not all items have weights
  }[];
  isDiagnostics?: boolean; // Optional with default false
}

const SectionComponent: React.FC<SectionComponentProps> = ({
  title,
  nestedObj,
  chartData,
  colors,
  topProblematicItems,
  isDiagnostics = false,
}) => {
  return (
    <Flex direction={"row"} style={{ width: "100%" }} justify="between">
      {/* Accordion section */}
      <Flex
        direction={"column"}
        align={"center"}
        gap={"5"}
        style={{ flexBasis: "30%" }}
      >
        <Box>
          <Badge size="2">{title}</Badge>
        </Box>
        <Box>
          <LevelAccordion nestedobj={nestedObj} isDiagnostics={isDiagnostics} />
        </Box>
      </Flex>

      {/* Pie chart section */}
      <Flex
        direction={"column"}
        align={"center"}
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
        gap={"5"}
        style={{ flexBasis: "30%" }}
      >
        <Box>
          <Text>Top 3 Problematic {title}:</Text>
        </Box>
        <Box>
          <Flex direction="column" gap="7" align="start">
            {topProblematicItems.map((item, index) => (
              <HoverCard.Root key={index}>
                <HoverCard.Trigger>
                  <Button style={{ background: "none" }}>
                    <Text as="p">
                      <Link href="#">
                        {item.name}:{" "}
                        <Strong style={{ color: "#0070f3", fontSize: "1.2em" }}>
                          {item.details.value.toFixed(3)}
                        </Strong>
                      </Link>
                    </Text>
                  </Button>
                </HoverCard.Trigger>
                <HoverCard.Content>
                  <Text as="div" size="1" style={{ maxWidth: 250 }}>
                    {item.weight !== undefined && (
                      <Text as="p">
                        <Strong>Impact to Measures:</Strong>{" "}
                        {item.weight.toFixed(3)}
                      </Text>
                    )}
                    <Text as="p">
                      <Strong>Description:</Strong> {item.details.description}
                    </Text>
                  </Text>
                </HoverCard.Content>
              </HoverCard.Root>
            ))}
          </Flex>
        </Box>
      </Flex>
    </Flex>
  );
};

export default SectionComponent;