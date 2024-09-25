
export const getNormalColorBasedOnValue = (value: number, palette : any) => {
    if (value < 0.2) return palette.severe; 
    else if (value >= 0.2 && value < 0.4) return palette.high; 
    else if (value >= 0.4 && value < 0.6) return palette.medium; 
    else if (value >= 0.6 && value < 0.8) return palette.low; 
    else return palette.insignificant; 
  };


export const getDiagnosticColorBasedOnValue = (value: number, palette : any) => {
  if (value < 0.2) return palette.insignificant; 
  else if (value >= 0.2 && value < 0.5) return palette.low; 
  else if (value >= 0.5 && value < 0.8) return palette.medium; 
  else if (value >= 0.8 && value < .5) return palette.high; 
  else return palette.severe; 
};
