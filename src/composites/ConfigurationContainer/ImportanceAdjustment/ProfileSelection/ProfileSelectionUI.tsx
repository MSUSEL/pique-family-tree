// ProfileSelectionUI.tsx
import React from 'react';
import { Box, Select, Button, Flex, Text } from '@radix-ui/themes';
import {
  ChevronDownIcon,
  UploadIcon,
  DropdownMenuIcon,
} from '@radix-ui/react-icons';
import profilesData from '../../../../assets/PIQUE_json_files/ExamplePredefinedProfile.json';

interface ProfileSelectionUIProps {
  handleProfileChange: (value: string) => void;
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleApplyUpload: () => void;
  isApplyButtonActive: boolean;
  selectValue: string;
}

const ProfileSelectionUI: React.FC<ProfileSelectionUIProps> = ({
  handleProfileChange,
  handleFileUpload,
  handleApplyUpload,
  isApplyButtonActive,
  selectValue,
}) => {
  return (
    <Flex direction={"column"} style={{ margin: "10px" }}>
      <Flex>
        <Text size={"9"}> (Optional) Profile Selection</Text>
      </Flex>
      <Flex align={"start"} justify={"between"} gap={"7"} direction={"column"}>
        <Flex direction={"row"} align={"start"} justify={"start"} gap={"5"}>
          <Box>
            <Text>
              <DropdownMenuIcon /> Option 1. Predefined Industry Profiles:
            </Text>
          </Box>
          <Box>
            <Select.Root
              onValueChange={handleProfileChange}
              value={selectValue}
            >
              <Select.Trigger aria-label="Profile" className="trigger">
                <ChevronDownIcon />
              </Select.Trigger>
              <Select.Content className="content">
                {profilesData.map((profile, index) => (
                  <Select.Item key={index} value={profile.type}>
                    {profile.type}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Box>
        </Flex>

        <Flex direction={"row"} align={"start"} justify={"start"} gap={"5"}>
          <Box>
            <UploadIcon /> <Text>Option 2. Personal Profiles: </Text>
          </Box>
          <Box>
            <input type="file" onChange={handleFileUpload} />
          </Box>
          <Button
            color={isApplyButtonActive ? "blue" : "gray"}
            disabled={!isApplyButtonActive}
            onClick={handleApplyUpload}
          >
            Apply
          </Button>
        </Flex>

        {selectValue && (
          <Flex direction={"row"} align={"start"} justify={"start"} gap={"5"}>
            <Box>
              <Text>Current Selection: {selectValue}</Text>
            </Box>
          </Flex>
        )}
      </Flex>
    </Flex>
  );
};

export default ProfileSelectionUI;
