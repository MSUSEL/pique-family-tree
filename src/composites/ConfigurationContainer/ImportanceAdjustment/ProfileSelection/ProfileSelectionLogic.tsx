// ProfileSelectionLogic.tsx
import React, { useState } from 'react';
import { Profile } from '../../../../types';
import profilesData from '../../../../assets/PIQUE_json_files/ExamplePredefinedProfile.json';
import ProfileSelectionUI from './ProfileSelectionUI'; 

interface ProfileSelectionLogicProps {
  onProfileChange: (selectedProfiles: Profile[] | null) => void;
  selectedProfile: Profile | Profile[] | null;
}

const ProfileSelectionLogic: React.FC<ProfileSelectionLogicProps> = ({
  onProfileChange,
  selectedProfile,
}) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isApplyButtonActive, setIsApplyButtonActive] = useState(false);

  const handleProfileChange = (value: string) => {
    const filteredProfiles = profilesData.filter(
      (profile) => profile.type === value
    );
    onProfileChange(filteredProfiles.length > 0 ? filteredProfiles : null);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setIsApplyButtonActive(true);
    } else {
      setUploadedFile(null);
      setIsApplyButtonActive(false);
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
    <ProfileSelectionUI
      handleProfileChange={handleProfileChange}
      handleFileUpload={handleFileUpload}
      handleApplyUpload={handleApplyUpload}
      isApplyButtonActive={isApplyButtonActive}
      selectValue={selectedProfile ? Array.isArray(selectedProfile) ? selectedProfile[0].type : selectedProfile.type : ''}
    />
  );
};

export default ProfileSelectionLogic;
