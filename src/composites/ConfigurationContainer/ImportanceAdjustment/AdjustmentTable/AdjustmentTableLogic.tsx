import { useAtomValue } from "jotai";
import React, { useMemo, useState, useEffect, useCallback } from "react";
import { State } from "../../../../state";
import { Profile } from "../../../../types";
import * as schema from "../../../../data/schema";
import { AdjustmentTableUI, SliderMode } from "./AdjustmentTableUI";

interface Weights {
  [key: string]: number;
}

interface TQIEntry {
  weights: Weights;
}

interface AdjustmentTableProps {
  selectedProfile?: Profile[];
  isProfileApplied: boolean;
  updatedTQIRaw: number;
  onResetApplied: () => void;
  onWeightsChange: (weights: Weights) => void; // Add this prop
  onImportanceChange: (weights: Weights) => void; // Add this prop
  onValuesChange: (weights: Weights) => void; // Add this prop
}

export const AdjustmentTableLogic: React.FC<AdjustmentTableProps> = ({
  selectedProfile,
  isProfileApplied,
  updatedTQIRaw, 
  onResetApplied,
  onWeightsChange,
  onImportanceChange,
  onValuesChange,
}) => {
  const dataset = useAtomValue(State.dataset);
  if (!dataset) return null;

  const getInitialWeights = (
    selectedProfile: Profile[] | undefined,
    dataset: schema.base.Schema,
    useDataset: boolean,
    mode: SliderMode
  ): { [key: string]: number } => {
    let weights: Weights = {};
    if (selectedProfile && selectedProfile.length > 0 && !useDataset) {

      var profileWeights : any;
      // get either the importance or characteristic factor depending on mode
      if (mode === SliderMode.importance){
        profileWeights = selectedProfile[0].importance;
      }
      else if (mode === SliderMode.characteristics){
        profileWeights = selectedProfile[0].characteristic;        
      }

      weights = { ...profileWeights };      
    } 
    else {
      if (mode === SliderMode.importance){
        Object.entries(dataset.factors.tqi).forEach(([_, tqiEntry]) => {
          const entry = tqiEntry as TQIEntry;          
          Object.entries(entry.weights).forEach(([aspect, importance]) => {
            weights[aspect] = importance;
          });          
        });
      }

      //dataset.factors.quality_aspects[name]?.value || 0
      else if (mode === SliderMode.characteristics){
        Object.entries(dataset.factors.tqi).forEach(([_, tqiEntry]) => {
          const entry = tqiEntry as TQIEntry;          
          Object.entries(entry.weights).forEach(([aspect, importance]) => {
            weights[aspect] = dataset.factors.quality_aspects[aspect]?.value || 0;
          });          
        });
      }      
    }
    return weights;
  };  

  const sliderImportanceValues = useMemo(() => {
    const useDataset = !isProfileApplied;
    return getInitialWeights(selectedProfile, dataset, useDataset, SliderMode.importance);
  }, [selectedProfile, dataset, isProfileApplied]);

  // added
  const sliderCharacteristicValues = useMemo(() => {
    const useDataset = !isProfileApplied;
    return getInitialWeights(selectedProfile, dataset, useDataset, SliderMode.characteristics);
  }, [selectedProfile, dataset, isProfileApplied]);

  const [importanceValues, setImportanceValues] = useState<{ [key: string]: number }>(sliderImportanceValues);

  // added
  const [characteristicValues, setCharacteristicValues] = useState<{ [key: string]: number }>(sliderCharacteristicValues);

  useEffect(() => {
    setImportanceValues(sliderImportanceValues);
    onImportanceChange(sliderImportanceValues);
  }, [sliderImportanceValues]);

  // added
  useEffect(() => {
    setCharacteristicValues(sliderCharacteristicValues);
  }, [sliderCharacteristicValues]);

  const resetAllAdjustments = () => {

    var resetValues = getInitialWeights(selectedProfile, dataset, true, SliderMode.importance);
    setImportanceValues(resetValues);

    resetValues = getInitialWeights(selectedProfile, dataset, true, SliderMode.characteristics);
    setCharacteristicValues(resetValues);

    onResetApplied();
  };

  const recalculatedWeights = useMemo(() => {
    const newWeights: Weights = {};
    Object.keys(importanceValues).forEach((name) => {
      const totalImportance = Object.values(importanceValues).reduce(
        (sum, importance) => sum + importance,
        0
      );
      newWeights[name] = importanceValues[name] / totalImportance;
    });
    return newWeights;
  }, [importanceValues]);

  useEffect(() => {
    console.log('onweightschanged');
    onWeightsChange(recalculatedWeights);
  }, [recalculatedWeights, onWeightsChange]);

  useEffect(() => {
    onValuesChange(characteristicValues);
  }, [characteristicValues, onValuesChange]);

  const handleSliderChange = (name: string, newValue: number, mode : SliderMode) => {
    if (mode === SliderMode.characteristics){
      setCharacteristicValues((prev) => ({ ...prev, [name]: newValue }));
    }
    else if (mode === SliderMode.importance){
      setImportanceValues((prev) => ({ ...prev, [name]: newValue }));
      onImportanceChange(importanceValues);
    }   
  };

  const handleDownload = () => {
    let weights: Weights = {};
    Object.entries(dataset.factors.tqi).forEach(([_, tqiEntry]) => {
      const entry = tqiEntry as TQIEntry;
      Object.entries(entry.weights).forEach(([aspect, importance]) => {
        weights[aspect] = importance;
      });
    });

    let changedAspects: any = [];
    Object.entries(importanceValues).forEach(
      ([aspect, recalculatedImportance]) => {
        if (recalculatedImportance !== weights[aspect]) {
          changedAspects.push(aspect);
        }
      }
    );

    let filename =
      changedAspects.length > 0
        ? `Custom_Profile_Changed_${changedAspects.join("_")}.json`
        : `Custom_Profile_Unchanged.json`;

    let profileToDownload: Profile = {
      type: "Custom Profile",
      importance: recalculatedWeights,
      characteristic: characteristicValues,
    };

    const json = JSON.stringify(profileToDownload, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <AdjustmentTableUI
      dataset={dataset}
      characteristicValues={characteristicValues}
      importanceValues={importanceValues}
      recalculatedWeights={recalculatedWeights}
      updatedTQIRaw={updatedTQIRaw}
      handleSliderChange={handleSliderChange}
      resetAllAdjustments={resetAllAdjustments}
      handleDownload={handleDownload}
    />
  );
};
