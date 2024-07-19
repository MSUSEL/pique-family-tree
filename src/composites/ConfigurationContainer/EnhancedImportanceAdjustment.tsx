import { useState } from "react";
import {
  Button,
  Flex,
  Text,
  HoverCard,
  Link,
  Strong,
  Callout,
  Box,
  Separator,
  IconButton,
} from "@radix-ui/themes";
import { InfoCircledIcon, GearIcon, Cross2Icon } from "@radix-ui/react-icons";
import * as Dialog from "@radix-ui/react-dialog";
import * as Tabs from "@radix-ui/react-tabs";
import "../Style/Dialog.css";

import { AdjustmentTableLogic } from "./ImportanceAdjustment/AdjustmentTable/AdjustmentTableLogic";
import ProfileSelectionLogic from "./ImportanceAdjustment/ProfileSelection/ProfileSelectionLogic";
import { Profile } from "../../types";
import contributionExampleImg from "../../assets/contribution_example.png";
import sensitivityExampleImg from "../../assets/sensitivity_example.png";
import strategiesExampleImg from "../../assets/strategies_example.png";


export const EnhancedImportanceAdjustment = () => {
  const [selectedProfile, setSelectedProfile] = useState<
    Profile | Profile[] | null
  >(null);

  const handleProfileApply = (profile: Profile[] | null) => {
    setSelectedProfile(profile);
  };

  const isProfileApplied = selectedProfile !== null;

  const handleReset = () => {
    setSelectedProfile(null);
  };

  return (
    <Flex direction="column" gap="3" align="start">
      <Box>
        <HoverCard.Root>
          <HoverCard.Trigger asChild>
            <Link href="#" size="3" style={{ margin: "0px" }}>
              <GearIcon /> Dynamic Importance Adjustment
            </Link>
          </HoverCard.Trigger>
          <HoverCard.Content>
            <Text as="div" size="1" style={{ maxWidth: 325 }}>
              For Quality Characteristics, <Strong>weights</Strong>, shown as
              numbers aligning on edges in the tree display, indicate the
              relative importance among the quality aspects in consideration.
              Since the industry requirements could be various, users are
              welcome to tune the weights by adjusting the corresponding
              importance to prioritize different characteristics.
            </Text>
          </HoverCard.Content>
        </HoverCard.Root>
      </Box>

      <Box>
        <Callout.Root>
          <Callout.Icon>
            <InfoCircledIcon />
          </Callout.Icon>
          <Callout.Text>
            Currently, the adjustment is only applicable for{" "}
            <Strong>Quality Characteristics</Strong>
            (i.e., the 2nd level of the tree display, and the 2nd expandable box
            in the list display).
          </Callout.Text>
        </Callout.Root>
      </Box>

      <Box>
        <Dialog.Root>
          <Dialog.Trigger asChild>
            <Button size="2" className="Button violet">
              Adjust
            </Button>
          </Dialog.Trigger>

          <Dialog.Portal>
            <Dialog.Overlay className="DialogOverlay" />
            <Dialog.Content
              className="DialogContent"
              style={{
                display: "grid",
                gridTemplateRows: "auto 1fr auto",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}
            >
              {/* Title block */}
              <Box style={{ gridColumn: "span 2" }}>
                <Dialog.Title className="DialogTitle">
                  Characteristics and corresponding weights
                </Dialog.Title>
                <Dialog.Description className="DialogDescription">
                  Adjust the importance of characteristics, the weights will be
                  recalculated automatically.
                </Dialog.Description>
              </Box>

              <Separator my="3" size="4" style={{ gridColumn: "span 2" }} />

              {/* Middle-left block: ProfileSelectionLogic and AdjustmentTableLogic */}
              <Box style={{ gridRow: "2", gridColumn: "1" }}>
                <ProfileSelectionLogic
                  onProfileChange={handleProfileApply}
                  selectedProfile={selectedProfile}
                />
                <Separator my="3" size="4" />
                <AdjustmentTableLogic
                  selectedProfile={
                    Array.isArray(selectedProfile) ? selectedProfile : undefined
                  }
                  isProfileApplied={isProfileApplied}
                  onResetApplied={handleReset}
                />
              </Box>

              {/* Middle-right block: Tabs */}
              <Box style={{ gridRow: "2", gridColumn: "2" }}>
                <Tabs.Root defaultValue="contribution">
                  <Tabs.List>
                    <Tabs.Trigger value="contribution">
                      Contribution
                    </Tabs.Trigger>
                    <Tabs.Trigger value="sensitivity">Sensitivity</Tabs.Trigger>
                  </Tabs.List>
                  <Tabs.Content value="contribution">
                    {/* Placeholder for Contribution content */}
                    <Box style={{ padding: "16px", border: "1px dashed #ccc" }}>
                      Contribution Content Placeholder
                      <img
                        src={contributionExampleImg}
                        alt="Contribution Example"
                        style={{ width: "100%", marginTop: "16px" }}
                      />
                    </Box>
                  </Tabs.Content>
                  <Tabs.Content value="sensitivity">
                    {/* Placeholder for Sensitivity content */}
                    <Box style={{ padding: "16px", border: "1px dashed #ccc" }}>
                      Sensitivity Content Placeholder
                      <img
                        src={sensitivityExampleImg}
                        alt="Sensitivity Example"
                        style={{ width: "100%", marginTop: "16px" }}
                      />
                    </Box>
                  </Tabs.Content>
                </Tabs.Root>
              </Box>

              {/* Bottom block: Strategies */}
              <Box
                style={{
                  gridColumn: "span 2",
                  padding: "16px",
                  border: "1px dashed #ccc",
                }}
              >
                Strategies Content Placeholder
                <img
                        src={strategiesExampleImg}
                        alt="Strategy Example"
                        style={{ width: "60%", marginTop: "16px" }}
                      />
              </Box>

              <Dialog.Close asChild>
                <IconButton className="IconButton" aria-label="Close">
                  <Cross2Icon />
                </IconButton>
              </Dialog.Close>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </Box>
    </Flex>
  );
};
