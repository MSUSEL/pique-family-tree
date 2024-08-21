// define all common types here

//for configuration - importance adjustment - profile selection 
export interface Profile {
  type: string;
  importance: {
    [qualityAspect: string]: number;
  };
  // added for characteristic slider
  characteristic: {
    [qualityAspect: string]: number;
  }
}

  