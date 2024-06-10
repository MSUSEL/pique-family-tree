import React, {useState } from "react";
import {countChars, displayDSList} from "./descriptiveStats";


const DSSide = ({data}) => {
    const [isMenuVisible, setMenuVisible] = useState(false);
    const [cDropStates, setCDropStates] = useState(Array(15).fill(false));

    const toggleMenu = () => {
        setMenuVisible(!isMenuVisible);
    };

    const DescStats = countChars(data);

    return (
        <div>
        <button className="statistics-button" onClick={toggleMenu}>Descriptive Statistics</button>
            <div className={`statistics-panel ${isMenuVisible ? 'visible' : 'invisible'}`}>
                {
                    <div>
                    {/* <h3>Descriptive Statistics</h3> */}
                    {/* Quality Characteristics */}
                    <h4>Quality Characteristics</h4>
                    
                    <p class = "dsSevereLevelCard">Severe: {DescStats.qChar[0]}
                    <button onClick={() => {
                        setCDropStates(prevStates => {
                            const updatedDropStates = [...prevStates];
                            updatedDropStates[0] = !prevStates[0];
                            return updatedDropStates;
                        });
                        }}>&or;</button></p>
                    {
                        cDropStates[0] && displayDSList('quality_aspects', 'severe', DescStats)
                    }

                    <p class = "dsHighLevelCard">High: {DescStats.qChar[1]} 
                    <button onClick={() => {
                        setCDropStates(prevStates => {
                            const updatedDropStates = [...prevStates];
                            updatedDropStates[1] = !prevStates[1];
                            return updatedDropStates;
                        });
                        }}>&or;</button></p>
                    {
                        cDropStates[1] && displayDSList('quality_aspects', 'high', DescStats)
                    }

                    <p class = "dsModerateLevelCard">Moderate: {DescStats.qChar[2]}
                    <button onClick={() => {
                        setCDropStates(prevStates => {
                            const updatedDropStates = [...prevStates];
                            updatedDropStates[2] = !prevStates[2];
                            return updatedDropStates;
                        });
                        }}>&or;</button></p>
                    {
                        cDropStates[2] && displayDSList('quality_aspects', 'moderate', DescStats)
                    }

                    <p class = "dsMinorLevelCard">Minor: {DescStats.qChar[3]}
                    <button onClick={() => {
                        const updatedDropStates = [...cDropStates];
                        updatedDropStates[3] = !cDropStates[3];
                        setCDropStates(updatedDropStates);
                        }}>&or;</button></p>
                    {
                        cDropStates[3] && displayDSList('quality_aspects', 'minor', DescStats)
                    }
                    
                    <p class = "dsInsignificantLevelCard">Insignificant: {DescStats.qChar[4]}
                    <button onClick={() => {
                        setCDropStates(prevStates => {
                            const updatedDropStates = [...prevStates];
                            updatedDropStates[4] = !prevStates[4];
                            return updatedDropStates;
                        });
                        }}>&or;</button></p>
                    {
                        cDropStates[4] && displayDSList('quality_aspects', 'insignificant', DescStats)
                    }


                    {/* Quality Factors */}
                    <h4>Quality Factors</h4>
                    <p class = "dsSevereLevelCard">Severe: {DescStats.qFact[0]}
                    <button onClick={() => {
                        setCDropStates(prevStates => {
                            const updatedDropStates = [...prevStates];
                            updatedDropStates[5] = !prevStates[5];
                            return updatedDropStates;
                        });
                        }}>&or;</button></p>
                    {
                        cDropStates[5] && displayDSList('product_factors', 'severe', DescStats)
                    }
                    
                    <p class = "dsHighLevelCard">High: {DescStats.qFact[1]}
                    <button onClick={() => {
                        setCDropStates(prevStates => {
                            const updatedDropStates = [...prevStates];
                            updatedDropStates[6] = !prevStates[6];
                            return updatedDropStates;
                        });
                        }}>&or;</button></p>
                    {
                        cDropStates[6] && displayDSList('product_factors', 'high', DescStats)
                    }
                    
                    <p class = "dsModerateLevelCard">Moderate: {DescStats.qFact[2]}
                    <button onClick={() => {
                        setCDropStates(prevStates => {
                            const updatedDropStates = [...prevStates];
                            updatedDropStates[7] = !prevStates[7];
                            return updatedDropStates;
                        });
                        }}>&or;</button></p>
                    {
                        cDropStates[7] && displayDSList('product_factors', 'moderate', DescStats)
                    }
                    
                    <p class = "dsMinorLevelCard">Minor: {DescStats.qFact[3]}
                    <button onClick={() => {
                        setCDropStates(prevStates => {
                            const updatedDropStates = [...prevStates];
                            updatedDropStates[8] = !prevStates[8];
                            return updatedDropStates;
                        });
                        }}>&or;</button></p>
                    {
                        cDropStates[8] && displayDSList('product_factors', 'minor', DescStats)
                    }
                    
                    <p class = "dsInsignificantLevelCard">Insignificant: {DescStats.qFact[4]}
                    <button onClick={() => {
                        setCDropStates(prevStates => {
                            const updatedDropStates = [...prevStates];
                            updatedDropStates[9] = !prevStates[9];
                            return updatedDropStates;
                        });
                        }}>&or;</button></p>
                    {
                        cDropStates[9] && displayDSList('product_factors', 'insignificant', DescStats)
                    }

                    {/* Quality Factors Measures */}
                    <h4>Measures for Quality Factors</h4>
                    <p class = "dsSevereLevelCard">Severe: {DescStats.qfMeas[0]}
                    <button onClick={() => {
                        setCDropStates(prevStates => {
                            const updatedDropStates = [...prevStates];
                            updatedDropStates[10] = !prevStates[10];
                            return updatedDropStates;
                        });
                        }}>&or;</button></p>
                    {
                        cDropStates[10] && displayDSList('measures', 'severe', DescStats)
                    }
                    
                    <p class = "dsHighLevelCard">High: {DescStats.qfMeas[1]}
                    <button onClick={() => {
                        setCDropStates(prevStates => {
                            const updatedDropStates = [...prevStates];
                            updatedDropStates[11] = !prevStates[11];
                            return updatedDropStates;
                        });
                        }}>&or;</button></p>
                    {
                        cDropStates[11] && displayDSList('measures', 'high', DescStats)
                    }
                    
                    <p class = "dsModerateLevelCard">Moderate: {DescStats.qfMeas[2]}
                    <button onClick={() => {
                        setCDropStates(prevStates => {
                            const updatedDropStates = [...prevStates];
                            updatedDropStates[12] = !prevStates[12];
                            return updatedDropStates;
                        });
                        }}>&or;</button></p>
                    {
                        cDropStates[12] && displayDSList('measures', 'moderate', DescStats)
                    }
                    
                    <p class = "dsMinorLevelCard">Minor: {DescStats.qfMeas[3]}
                    <button onClick={() => {
                        setCDropStates(prevStates => {
                            const updatedDropStates = [...prevStates];
                            updatedDropStates[13] = !prevStates[13];
                            return updatedDropStates;
                        });
                        }}>&or;</button></p>
                    {
                        cDropStates[13] && displayDSList('measures', 'minor', DescStats)
                    }
                    
                    <p class = "dsInsignificantLevelCard">Insignificant: {DescStats.qfMeas[4]}
                    <button onClick={() => {
                        setCDropStates(prevStates => {
                            const updatedDropStates = [...prevStates];
                            updatedDropStates[14] = !prevStates[14];
                            return updatedDropStates;
                        });
                        }}>&or;</button></p>
                    {
                        cDropStates[14] && displayDSList('measures', 'insignificant', DescStats)
                    }
                    </div>
                }
            </div>
        </div>
    );
};

export default DSSide;