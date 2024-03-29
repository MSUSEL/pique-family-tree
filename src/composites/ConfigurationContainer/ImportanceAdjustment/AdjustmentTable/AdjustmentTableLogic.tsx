// AdjustmentTableLogic.tsx
import { useAtomValue } from "jotai";
import React, { useMemo, useState } from "react";
import { State } from "../../../../state";
import { Profile } from "../../../../types";
import * as schema from "../../../../data/schema";
import { AdjustmentTableUI } from "./AdjustmentTableUI";

interface Weights {
  [key: string]: number;
}

interface TQIEntry {
  weights: Weights;
}

interface AdjustmentTableProps {
  selectedProfile?: Profile[];
  isProfileApplied: boolean;
  onResetApplied: () => void;
}

export const AdjustmentTableLogic: React.FC<AdjustmentTableProps> = ({
  selectedProfile,
  isProfileApplied,
  onResetApplied,
}) => {
  const dataset = useAtomValue(State.dataset);
  if (!dataset) return null;

  const getInitialWeights = (
    selectedProfile: Profile[] | undefined,
    dataset: schema.base.Schema,
    useDataset: boolean
  ): { [key: string]: number } => {
    let weights: Weights = {};
    if (selectedProfile && selectedProfile.length > 0 && !useDataset) {
      const profileWeights = selectedProfile[0].importance;
      weights = { ...profileWeights };
    } else {
      Object.entries(dataset.factors.tqi).forEach(([_, tqiEntry]) => {
        const entry = tqiEntry as TQIEntry;
        Object.entries(entry.weights).forEach(([aspect, importance]) => {
          weights[aspect] = importance;
        });
      });
    }
    return weights;
  };

  const sliderValues = useMemo(() => {
    const useDataset = !isProfileApplied;
    return getInitialWeights(selectedProfile, dataset, useDataset);
  }, [selectedProfile, dataset, isProfileApplied]);

  const [values, setValues] = useState<{ [key: string]: number }>(sliderValues);
  useMemo(() => {
    setValues(sliderValues);
  }, [sliderValues]);

  const resetAllAdjustments = () => {
    const resetValues = getInitialWeights(selectedProfile, dataset, true);
    setValues(resetValues);
    onResetApplied();
  };

  const recalculatedWeights = useMemo(() => {
    const newWeights: Weights = {};
    Object.keys(values).forEach((name) => {
      const totalImportance = Object.values(values).reduce(
        (sum, importance) => sum + importance,
        0
      );
      newWeights[name] = values[name] / totalImportance;
    });
    return newWeights;
  }, [values]);

  const handleSliderChange = (name: string, newImportance: number) => {
    setValues((prev) => ({ ...prev, [name]: newImportance }));
  };

  const handleDownload = () => {
    // Define the initial weights
    let weights: Weights = {};
    Object.entries(dataset.factors.tqi).forEach(([_, tqiEntry]) => {
      const entry = tqiEntry as TQIEntry;
      Object.entries(entry.weights).forEach(([aspect, importance]) => {
        weights[aspect] = importance;
      });
    });

    // Create a list of aspects that have changed
    let changedAspects: any = [];
    Object.entries(values).forEach(
      ([aspect, recalculatedImportance]) => {
        if (recalculatedImportance !== weights[aspect]) {
          changedAspects.push(aspect);
        }
      }
    );

    // Generate the filename based on the changed aspects
    let filename =
      changedAspects.length > 0
        ? `Custom_Profile_Changed_${changedAspects.join("_")}.json`
        : `Custom_Profile_Unchanged.json`;

    // Create a Profile object to download
    let profileToDownload: Profile = {
      type: "Custom Profile",
      importance: recalculatedWeights,
    };

    const json = JSON.stringify(profileToDownload, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename; // Use the generated filename
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <AdjustmentTableUI
      dataset={dataset}
      values={values}
      recalculatedWeights={recalculatedWeights}
      handleSliderChange={handleSliderChange}
      resetAllAdjustments={resetAllAdjustments}
      handleDownload={handleDownload}
    />
  );
};
