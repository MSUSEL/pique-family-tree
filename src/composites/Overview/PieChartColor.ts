
const getCssVariableValue = (variable: string) => {
  return window.getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
};

// Retrieve color values from the CSS variables
const insignificantColor = getCssVariableValue('--insignificant-color');
const lowColor = getCssVariableValue('--low-color');
const mediumColor = getCssVariableValue('--medium-color');
const highColor = getCssVariableValue('--high-color');
const severeColor = getCssVariableValue('--severe-color');


// Define colors for each slice of the pie chart
export const COLORS: { [key: string]: string } = {
  Severe: severeColor,
  High: highColor,
  Medium: mediumColor,
  Low: lowColor,
  Insignificant: insignificantColor,
};
