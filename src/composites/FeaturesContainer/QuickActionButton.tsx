import { useAtom, useAtomValue } from "jotai";
import { State } from "../../state";
import { Switch, Flex, HoverCard, Link, Text, Strong, Box  } from "@radix-ui/themes";
import { BoxIcon, CaretDownIcon, SwitchIcon } from "@radix-ui/react-icons";
import { HideZeroWeightsSwitch } from "./QuickActions/HideZeroWeightsSwitch";
import { HidePerfectNodesSwitch } from "./QuickActions/HidePerfectNodesSwitch";
import React from 'react';
import * as Separator from '@radix-ui/react-separator';
import '../Style/Separator.css';
import '../Style/Slider.css';

export const QuickActionButton = () => {

  return (

    <Flex gap="3" align="start" direction="column">
      <Box>
      <HoverCard.Root>
              <HoverCard.Trigger>
                <Link href="#" size='3' style={{margin: '0px', }} > <SwitchIcon /> Quick Actions for Decluttering</Link>
              </HoverCard.Trigger>
              <HoverCard.Content>
                <Text as="div" size="1" style={{ maxWidth: 325 }}>
                  <Strong>Quick Actions</Strong> provides several options that
                  predefined for users to perform quickly for decluttering.
                </Text>
              </HoverCard.Content>
            </HoverCard.Root>
      </Box>

      <Box>
      <HideZeroWeightsSwitch />
      </Box>

      {/*<Box>
      <HidePerfectNodesSwitch />
      </Box>*/}

    </Flex>
  );
};