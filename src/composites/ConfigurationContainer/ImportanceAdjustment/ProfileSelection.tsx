import React, { useMemo, useState } from "react";
import { Box, Select, Button, Flex, Text, Separator } from "@radix-ui/themes";
import {
  ChevronDownIcon,
  UploadIcon,
  SliderIcon,
  DropdownMenuIcon,
} from "@radix-ui/react-icons";
import { Profile } from "../../../types";
import profilesData from "../../../assets/PIQUE_json_files/ExamplePredefinedProfile.json";

interface ProfileSelectionProps {
  onProfileChange: (selectedProfiles: Profile[] | null) => void;
  selectedProfile: Profile | Profile[] | null;
}

export const ProfileSelection: React.FC<ProfileSelectionProps> = ({
  onProfileChange,
  selectedProfile,
}) => {
  const selectValue = selectedProfile
    ? Array.isArray(selectedProfile)
      ? selectedProfile[0].type
      : selectedProfile.type
    : "";

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isApplyButtonActive, setIsApplyButtonActive] = useState(false);

  // Function to handle profile selection changes
  const handleProfileChange = (value: string) => {
    const filteredProfiles = profilesData.filter(
      (profile) => profile.type === value
    );
    onProfileChange(filteredProfiles.length > 0 ? filteredProfiles : null);
  };

  // Function to handle file uploads
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setIsApplyButtonActive(true); // Enable the "Apply" button
    } else {
      setUploadedFile(null);
      setIsApplyButtonActive(false); // Disable the "Apply" button if no file is selected
    }
  };

  const handleApplyUpload = () => {
    if (!uploadedFile) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const profiles: Profile = JSON.parse(e.target?.result as string);
        onProfileChange([profiles]); 
        setIsApplyButtonActive(false); 
        setUploadedFile(null); 
      } catch (error) {
        console.error("Error parsing the uploaded file", error);
        onProfileChange(null);
      }
    };
    reader.readAsText(uploadedFile);
  };

  return (
    <Flex direction={"column"} style={{ margin: "10px" }}>
      <Flex>
        <Text size={"9"}> (Optional) Profile Selection</Text>
      </Flex>
      <Flex align={"start"} justify={"between"} gap={"7"} direction={"column"}>
        <Flex direction={"row"} align={"start"} justify={"start"} gap={"5"}>
          <Box>
            <Text>
              {" "}
              <DropdownMenuIcon /> Option 1. Predefined Industry Profiles:{" "}
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
            {" "}
            <UploadIcon /> <Text>Option 2. Personal Profiles: </Text>
          </Box>
          <Box>
            {" "}
            <input type="file" onChange={handleFileUpload} />{" "}
          </Box>
          <Button
            color={isApplyButtonActive ? "blue" : "gray"}
            disabled={!isApplyButtonActive}
            onClick={handleApplyUpload}
          >
            Apply
          </Button>
        </Flex>

        <Flex direction={"row"} align={"start"} justify={"start"} gap={"5"}>
          {selectValue && (
            <Box>
              <Text>Current Selection: {selectValue}</Text>
            </Box>
          )}
        </Flex>
      </Flex>
    </Flex>
  );
};
