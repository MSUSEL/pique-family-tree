import {divide, matrix, multiply} from "mathjs";

/***
 * Calculate the score according to the evaluator function
 *
 * @param {array} values Values of the child nodes or an array of values.
 * @param {array} importance Weights of the child nodes.
 * @param {number} normCoefficient Normalization parameters.
 * @param {string} fcnName Name of the evaluator function.
 *
 * @return {*[]} The score or array of scores
 */
export function calcScore(values : number[], importance: number[], normCoefficient : number, fcnName : string){
  let score = null
  let score_norm = null
  if (fcnName === "defaults"){
      score = calcMediumCrit(values, importance);
      score_norm = divide(score, normCoefficient);
  }
  return score_norm
}

export function calcMediumCrit(values : number[], importance : number[]){
  const val_mat = matrix(values);
  const w_mat = matrix(importance);
  return multiply(val_mat, w_mat)
}

/***
* Returns the sensitivity of a child node for given set of values.
*
* @param {array} values The current child node values.
* @param {array} importance The current importance of the child nodes.
* @param {number} idx The child node index to be evaluated.
* @param {number} normCoefficient The normalization factor.
* @param {string} fcnName The function name to be used for evaluation.
* @param {array} x_tick The set of node values to be evaluated
*
* @returns {array} The set of values for the given x_tick
*/
export function calcSensitivityNode(values : number[], importance: number[], idx : number, 
  normCoefficient : number, fcnName : string, x_tick : number[]){

  let y_ticks =[];
  const n_x_tick = x_tick.length;
  let x_array = Array(n_x_tick).fill(values.slice())

  for (let i =0; i<n_x_tick; i=i+1){
      x_array[i][idx]= x_tick[i];
      y_ticks.push(calcScore(x_array[i], importance, normCoefficient, fcnName))
  }
  return y_ticks
}

/***
* Returns the sensitivity of for all child nodes for given set of values
*
* @param {array} values The current child node values.
* @param {array} importance The current importance of the child nodes.
* @param {number} normCoefficient The scaling factor for normalization
* @param {string} fcnName The function name to be used for evaluation.
* @param {array} x_tick The set of node values to be evaluated
*
* @returns {array} The array of arrays for the given x_tick
*/
export function calcSensitivity(values : number[], importance : number[], normCoefficient : number, fcnName : string, x_tick : number[]){
  let y_sensitivity = [];
  const n_nodes = values.length;
  const node_idx = Array.apply(null, {length: n_nodes}).map(Number.call, Number)

  y_sensitivity.push(node_idx.map(idx=>
      (calcSensitivityNode(values, importance, idx, normCoefficient,fcnName, x_tick)))
  )
  return y_sensitivity
}