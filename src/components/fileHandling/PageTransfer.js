import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import * as R from "ramda";
import TreeDisplay from "../treeDisplay/TreeDisplay";
import {
  sortASCforValues,
  sortDESCforValues,
  sortASCforWeights,
  sortDESCforWeights,
} from "../features/Sort";
import {
  filterByValueRange,
  filterRiskLevels,
  filterByWeightRange,
} from "../features/Filter";
import cloneDeep from "lodash/cloneDeep";
import { countChars, displayDSList } from "./descriptiveStats";
import DSSide from "./DSSideMenu";
import {
  resetTreeDisplay,
  resetTreeView,
  nodesForPanelBoxes,
  clearSidePanel,
} from "../treeDisplay/TreeDisplay";
import "./UploadFile.css";
import "../treeDisplay/TreeDisplay.css";
import "../top_header/TopHeader.css";
import { ListDisplay } from "../layouts/List.js";
import { legendData } from "../legend/legend";
import {
  Button,
  ControlGroup,
  InputGroup,
  Menu,
  MenuItem,
  Popover,
} from "@blueprintjs/core";
import { ToggleButton } from "../atomics/ToggleButtons";
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";

const SORT_TYPE_NAMES = {
  asc_weight: "Weight - Ascending",
  desc_weight: "Weight - Descending",
  desc_value: "Value - Descending",
  asc_value: "Value - Ascending",
};

export default function PageTransfer(props) {
  const { fileData } = props;
  // initilize
  const [initialFileData, setInitialFileData] = useState(null);
  // sort, by values or by weights
  const [sortedData, setSortedData] = useState(null);
  const [sortType, setSortType] = useState(null);

  //reset
  const [reset, setReset] = useState(false);
  // filter
  //1. by risk level
  const [selectedRiskLevels, setSelectedRiskLevels] = useState([]);
  const [isDoneButtonClickable, setIsDoneButtonClickable] = useState(false);
  const [filteredCategoryData, setfilteredCategoryData] = useState(null);
  // 2. by range, value or weight, min - max
  const [filteredRangeData, setFilteredRangeData] = useState(null);
  const [isFilterRangeOpen, setIsFilterRangeOpen] = useState(false);
  const [isWeightFilterRangeOpen, setIsWeightFilterRangeOpen] = useState(false);
  const [minValue, setMinValue] = useState("");
  const [maxValue, setMaxValue] = useState("");

  // descriptiove statistics
  const [showStatistics, setShowStatistics] = useState(false);

  //for list layout:
  const [isListLayoutModalOpen, setIsListLayoutModalOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState("none"); // 'none', 'ascending', 'descending'
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [listSortedData, setListSortedData] = useState(null);

  //for descriptive statistics list:
  const [isCountListOpen, setIsCountListOpen] = useState(false);

  const [cDropStates, setCDropStates] = useState(Array(15).fill(false));
  // FIXME DELETE
  //   useEffect(() => {
  //     console.log("Current sort order:", sortOrder); // <-- Add this line
  //     if (fileData && sortOrder) {
  //       const listSorted = deepSort(fileData, sortOrder);
  //       setListSortedData(listSorted);
  //       console.log(listSortedData);
  //     }
  //   }, [fileData, sortOrder]);

  const [categoryButtonStatus, setCategoryButtonStatus] = useState(() => {
    const initialStatus = {
      Insignificant: true,
      Minor: false,
      Moderate: false,
      High: true,
      Severe: true,
    };
    /*
        for (const level of riskLevels) {
            const { productFactorsCount, qualityAspectsCount } = checkOneCategoryStatus(fileData, level);
            if (productFactorsCount + qualityAspectsCount === 0) {
                initialStatus[level] = false;
            }
            console.log(initialStatus[level])
        }*/
    return initialStatus;
  });

  // data to use for display
  const dataToUse =
    sortedData || filteredCategoryData || filteredRangeData || fileData;

  // all layouts
  const [layout, setLayout] = useState("tree"); // default layout is 'tree'
  const setListLayout = () => {
    setLayout("list");
  };

  const setTreeLayout = () => {
    setLayout("tree");
  };

  // sort
  const handleSort = (sortType) => {
    let sorted;
    let fileDataCopy = cloneDeep(fileData);
    if (sortType === "asc_value") {
      sorted = sortASCforValues(filteredCategoryData || fileDataCopy);
    } else if (sortType === "desc_value") {
      sorted = sortDESCforValues(filteredCategoryData || fileDataCopy);
    } else if (sortType === "asc_weight") {
      sorted = sortASCforWeights(filteredCategoryData || fileDataCopy);
    } else if (sortType === "desc_weight") {
      sorted = sortDESCforWeights(filteredCategoryData || fileDataCopy);
    }
    setSortedData(sorted);
    setSortType(sortType);
  };

  // filer - one or multiple risk level categories
  // Handle checkbox changes
  const handleCheckboxChange = (riskLevel) => {
    if (selectedRiskLevels.includes(riskLevel)) {
      // Remove the risk level from the array
      setSelectedRiskLevels(
        selectedRiskLevels.filter((item) => item !== riskLevel)
      );
    } else {
      // Add the risk level to the array
      setSelectedRiskLevels([...selectedRiskLevels, riskLevel]);
    }
  };
  React.useEffect(() => {
    setIsDoneButtonClickable(selectedRiskLevels.length > 0);
  }, [selectedRiskLevels]);

  const handleDoneClick = () => {
    let fileDataCopy = cloneDeep(fileData);
    let filteredFileData = filterRiskLevels(
      sortedData || fileDataCopy,
      selectedRiskLevels
    );
    setfilteredCategoryData(filteredFileData);

    console.log(
      "Performing filtering with selected risk levels:",
      selectedRiskLevels
    );
    console.log("Filtered file data:", filteredFileData);
  };

  // filter by range - node values
  const handlefilterByValueRange = () => {
    setIsFilterRangeOpen(true);
  };

  const handleApplyFilterByValueRange = () => {
    let min = parseFloat(minValue);
    let max = parseFloat(maxValue);
    let fileDataCopy = cloneDeep(fileData);
    let filtered = filterByValueRange(sortedData || fileDataCopy, min, max);
    console.log("filter by range:");
    console.log("fileData", fileData);
    console.log("filter results", filtered);
    setFilteredRangeData(filtered);
    setIsFilterRangeOpen(false);
  };

  const closeModal = () => {
    setIsFilterRangeOpen(false);
  };

  // filter by range - edge weights
  const handleFilterByWeightRange = () => {
    setIsWeightFilterRangeOpen(true);
  };

  const handleApplyFilterbyWeightRange = () => {
    let min = parseFloat(minValue);
    let max = parseFloat(maxValue);
    //const filtered = filterRange(fileData, min, max);
    let fileDataCopy = cloneDeep(fileData);
    // Filter the data based on the selected category using the copy
    let filtered = filterByWeightRange(sortedData || fileDataCopy, min, max); //weightRangeData;

    setFilteredRangeData(filtered);
    setIsWeightFilterRangeOpen(false);
  };

  const closeWeightModal = () => {
    setIsWeightFilterRangeOpen(false);
  };

  const handleReset = () => {
    console.log("reset:");
    setSortedData(null);
    setSortType(null);
    setfilteredCategoryData(null);
    setFilteredRangeData(null);
    setMinValue("");
    setMaxValue("");
    setReset(true);
    setTimeout(() => {
      setReset(false);
      setfilteredCategoryData(null);
      setFilteredRangeData(null);
    }, 0);
    //setSortOrder('none');

    // Reset the risk level checkboxes and done button
    setSelectedRiskLevels([]);
    setIsDoneButtonClickable(false);
  };

  useEffect(() => {
    if (fileData) {
      setInitialFileData(fileData);
    }
  }, [fileData]);

  useEffect(() => {
    if (reset) {
      setSortedData(null);
      setfilteredCategoryData(null);
      setFilteredRangeData(null);
    }
  }, [reset]);

  console.log("Current listSortedData:", listSortedData);
  console.log("PageTransfer fileData: ", fileData);

  return (
    <div className="unselectableText">
      {/* Descriptive Statistics Panel Button */}
      <button
        className="statistics-button"
        onClick={() => setShowStatistics(!showStatistics)}
      >
        Descriptive Statistics
      </button>

      {/* Descriptive Statistics Panel Content */}
      {showStatistics && (
        <div className="statistics-panel">
          {/* <h3>Descriptive Statistics</h3> */}
          {/* Quality Characteristics */}
          <h4>Quality Characteristics</h4>
          <p>Severe: {0}</p>
          <p>High: {0}</p>
          <p>Medium: {0}</p>
          <p>Low: {0}</p>
          <p>Insignificant: {6}</p>

          {/* Quality Factors */}
          <h4>Quality Factors</h4>
          <p>Severe: {1}</p>
          <p>High: {1}</p>
          <p>Medium: {0}</p>
          <p>Low: {0}</p>
          <p>Insignificant: {34}</p>

          {/* Quality Factors Measures */}
          <h4>Measures for Quality Factors</h4>
          <p>Severe: {3}</p>
          <p>High: {0}</p>
          <p>Medium: {1}</p>
          <p>Low: {0}</p>
          <p>Insignificant: {161}</p>
        </div>
      )}

      <div>
        {/* Reset Display */}
        <div className="dropdown">
          {/* <span className="dropbtn" onClick={() => handleReset()}>
            Reset Sorting & Filtering
          </span> */}
          <Button onClick={() => handleReset()}>
            Reset Sorting & Filtering
          </Button>
        </div>

        <Popover
          placement="bottom"
          minimal={true}
          content={
            <Menu>
              {["asc_weight", "desc_weight", "desc_value", "asc_value"].map(
                (sortTypeItem) => {
                  return (
                    <MenuItem
                      key={sortTypeItem}
                      active={sortType === sortTypeItem}
                      text={SORT_TYPE_NAMES[sortTypeItem]}
                      onClick={() => handleSort(sortTypeItem)}
                    />
                  );
                }
              )}
            </Menu>
          }
        >
          <Button
            icon={
              R.isNil(sortType)
                ? "sort"
                : sortType.startsWith("asc")
                ? "arrow-up"
                : "arrow-down"
            }
          >
            {sortType ? SORT_TYPE_NAMES[sortType] : "Sort"}
          </Button>
        </Popover>

        <Popover
          placement="bottom"
          minimal={true}
          content={
            <Menu>
              {["Insignificant", "Minor", "Moderate", "High", "Severe"].map(
                (riskLevel) => (
                  <MenuItem
                    key={riskLevel}
                    text={riskLevel}
                    active={selectedRiskLevels.includes(riskLevel)}
                    onClick={() => {
                      handleCheckboxChange(riskLevel);
                      //   handleDoneClick();
                    }}
                  />
                )
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "right",
                }}
              >
                <Button onClick={handleDoneClick}>Apply</Button>
              </div>
            </Menu>
          }
        >
          <Button>Filter (Risk)</Button>
        </Popover>

        <Popover
          placement="bottom"
          minimal={true}
          content={
            <div
              style={{
                padding: "1em",
              }}
            >
              <ControlGroup>
                <InputGroup
                  placeholder="min value"
                  value={minValue}
                  onChange={(e) => setMinValue(e.target.value)}
                  small={true}
                />
                <InputGroup
                  placeholder="max value"
                  small={true}
                  onChange={(e) => setMaxValue(e.target.value)}
                />
              </ControlGroup>
              <div style={{ display: "flex", justifyContent: "right" }}>
                <Button
                  intent="primary"
                  onClick={handleApplyFilterByValueRange}
                >
                  Apply
                </Button>
              </div>
            </div>
          }
        >
          <Button>Filter (Values)</Button>
        </Popover>

        <Popover
          placement="bottom"
          minimal={true}
          content={
            <div
              style={{
                padding: "1em",
              }}
            >
              <ControlGroup>
                <InputGroup
                  placeholder="min weight"
                  value={minValue}
                  onChange={(e) => setMinValue(e.target.value)}
                  small={true}
                />
                <InputGroup
                  placeholder="max weight"
                  small={true}
                  onChange={(e) => setMaxValue(e.target.value)}
                />
              </ControlGroup>
              <div style={{ display: "flex", justifyContent: "right" }}>
                <Button
                  intent="primary"
                  onClick={handleApplyFilterbyWeightRange}
                >
                  Apply
                </Button>
              </div>
            </div>
          }
        >
          <Button>Filter (Values)</Button>
        </Popover>

        {/* 
        <div className="main-dropdown">
          <button className="dropbtn">Filter</button>
          <div className="main-dropdown-content">
            <div className="sub-dropdown">
              <span className="dropbtn">Filter (Risk Levels)</span>
              <div className="sub-dropdown-content">
                {["Insignificant", "Minor", "Moderate", "High", "Severe"].map(
                  (riskLevel) => (
                    <div key={riskLevel}>
                      <input
                        type="checkbox"
                        id={riskLevel}
                        name={riskLevel}
                        checked={selectedRiskLevels.includes(riskLevel)}
                        onChange={() => handleCheckboxChange(riskLevel)}
                      />
                      <label htmlFor={riskLevel}>{riskLevel}</label>
                    </div>
                  )
                )}
                <button
                  onClick={handleDoneClick}
                  disabled={!isDoneButtonClickable}
                  style={{
                    backgroundColor: isDoneButtonClickable
                      ? "lightgreen"
                      : "lightgray",
                  }}
                >
                  Done
                </button>
              </div>
            </div>

            <div className="sub-dropdown">
              <span
                className="dropbtn"
                onClick={() => handlefilterByValueRange()}
              >
                Filter (Values Range)
              </span>
            </div>
            {isFilterRangeOpen && (
              <div className="custom-modal">
                <div className="modal-content">
                  <h2>Node Value Range</h2>
                  <h4>Please enter the range of node values</h4>
                  <input
                    type="text"
                    placeholder="Minimum node value"
                    value={minValue}
                    onChange={(e) => setMinValue(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Maximum node value"
                    value={maxValue}
                    onChange={(e) => setMaxValue(e.target.value)}
                  />
                  <div className="modal-actions">
                    <button onClick={handleApplyFilterByValueRange}>
                      Apply
                    </button>
                    <button onClick={closeModal}>Cancel</button>
                  </div>
                </div>
              </div>
            )}

            <div>
                {/* Reset Display */}
                <div className="dropdown">
                    <span className="dropbtn" onClick={() => handleReset()}>
                        Reset Sorting & Filtering
                    </span>
                </div>

                {/* Sort Dropdown */}
                <div className="dropdown">
                    <span className="dropbtn">Sort</span>
                    <div className="dropdown-content">
                        <button className={sortType === "asc" ? "selected" : ""} onClick={() => handleSort("asc")}>
                            Value - Ascending
                        </button>
                        <button className={sortType === "desc" ? "selected" : ""} onClick={() => handleSort("desc")}>
                            Value - Descending
                        </button>
                        <button className={sortType === "asc_weight" ? "selected" : ""} onClick={() => handleSort("asc_weight")}>
                            Weight - Ascending
                        </button>
                        <button className={sortType === "desc_weight" ? "selected" : ""} onClick={() => handleSort("desc_weight")}>
                            Weight - Descending
                        </button>
                    </div>
                </div>

                {/* Filter Dropdown */}
                <div className="dropdown">
                    <span className="dropbtn">Filter (One Category)</span>
                    <div className="dropdown-content">
                        {Object.keys(categoryButtonStatus).map(category => (
                            <button
                                key={category}
                                className={`${selectedCategory === category ? "selected" : ""} ${!categoryButtonStatus[category] ? "disabled" : ""}`}
                                onClick={() => handleFilterByOneCategory(category)}
                                disabled={!categoryButtonStatus[category]}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Filter Dropdown - multiple categories */}
                <div className="dropdown">
                    <span className="dropbtn">Filter (Categories) </span>
                    <div className="dropdown-content">
                        {Object.keys(categoryButtonStatus).map(category => (
                            <div key={category} className="checkbox-container" onClick={() => handleCustomCheckbox(category)}>
                                <span id={"custom-" + category} className={"custom-checkbox " + (selectedCategories.includes(category) ? "checked" : "")}></span>
                                <label htmlFor={category}>{category}</label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Filter by Range of values */}
                <div className="dropdown">
                    <span className="dropbtn" onClick={() => handleFilterByRange()}>
                        Filter (Values Range)
                    </span>
                </div>

                {/* Custom Modal */}
                {
                    isFilterRangeOpen && (
                        <div className="custom-modal">
                            <div className="modal-content">
                                <h2>Node Value Range</h2>
                                <h4>Please enter the range of node values</h4>
                                <input
                                    type="text"
                                    placeholder="Minimum node value"
                                    value={minValue}
                                    onChange={(e) => setMinValue(e.target.value)}
                                />
                                <input
                                    type="text"
                                    placeholder="Maximum node value"
                                    value={maxValue}
                                    onChange={(e) => setMaxValue(e.target.value)}
                                />
                                <div className="modal-actions">
                                    <button onClick={handleApplyFilter}>Apply</button>
                                    <button onClick={closeModal}>Cancel</button>
                                </div>
                            </div>
                        </div>
                    )
                }



                {/* Filter by Range of weights */}
                <div className="dropdown">
                    <span className="dropbtn" onClick={() => handleFilterByWeightRange()}>
                        Filter (Weights Range)
                    </span>
                </div>
                {/* Custom Modal */}
                {
                    isWeightFilterRangeOpen && (
                        <div className="custom-modal">
                            <div className="modal-content">
                                <h2>Weights Denoted on Edges </h2>
                                <h4>Please enter the range of weights</h4>
                                <input
                                    type="text"
                                    placeholder="Minimum weight"
                                    value={minValue}
                                    onChange={(e) => setMinValue(e.target.value)}
                                />
                                <input
                                    type="text"
                                    placeholder="Maximum weight"
                                    value={maxValue}
                                    onChange={(e) => setMaxValue(e.target.value)}
                                />
                                <div className="modal-actions">
                                    <button onClick={handleApplyWeightFilter}>Apply</button>
                                    <button onClick={closeWeightModal}>Cancel</button>
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* Layout Options Dropdown */}
                <div className="dropdown">
                    <span className="dropbtn">Layout Options</span>
                    <div className="dropdown-content">
                        <button className="layout-btn-doing">Tree (Default) </button>
                        <button className="layout-btn-doing" onClick={openListLayoutModal}>List</button>
                    </div>
                </div>
                {/* List Layout Modal */}
                <Modal
                    isOpen={isListLayoutModalOpen}
                    onRequestClose={closeListLayoutModal}
                    contentLabel="List Layout Modal"
                >
                    <h2>List Layout</h2>
                    {/* Sort based on node values */}
                    <button className="sort-button" onClick={() => setShowSortOptions(!showSortOptions)}>Sort - Node Values</button>
                    {showSortOptions && (
                        <div className="sort-dropdown">
                            <button className="sort-ascend-button" onClick={() => { setSortOrder('ascending'); setCurrentData(ascendingData); }}>Ascending</button>
                            <button className="sort-descend-button" onClick={() => { setSortOrder('descending'); setCurrentData(descendingData); }}>Descending</button>
                        </div>
                    )}

                    {/* Filter based on node categories*/}
                    <button className="sort-button" onClick={() => setShowFilterOptions(!showFilterOptions)}>Filter - Risk Category</button>
                    {showFilterOptions && (
                        <div className="sort-dropdown">
                            <button className="filter-button-insignificant" onClick={() => { setFilterOrder('Insignificant'); setCurrentData(insignificantData); }}>Insignificant</button>
                            <button className="filter-button-minor" onClick={() => { setFilterOrder('Minor'); setCurrentData(minorData); }}>Minor</button>
                            <button className="filter-button-moderate" onClick={() => { setFilterOrder('Moderate'); setCurrentData(moderateData); }}>Moderate</button>
                            <button className="filter-button-high" onClick={() => { setFilterOrder('High'); setCurrentData(highData); }}>High</button>
                            <button className="filter-button-severe" onClick={() => { setFilterOrder('Severe'); setCurrentData(severeData); }}>Severe</button>
                        </div>
                    )}

                    {/* Close panel of list */}
                    <button className="sort-button" onClick={closeListLayoutModal}>Close</button>

                    {renderNestedData(currentData)}
                </Modal>






            </div >

            {/* Legend Display */}
            < div className="legend-container" >
                <div className="legend">
                    <h3 className="legend-title">Risk Level</h3>
                    {legendData.map((item) => (
                        <div className="legend-item" key={item.color}>
                            <label htmlFor={item.category} className={`legend-color legend-color-${item.color}`} />

                            <span className="legend-category">{item.category}</span>
                            <span className="legend-range">(quality score: {item.range})</span>
                        </div>
                    ))}
            <div className="sub-dropdown">
              <span
                className="dropbtn"
                onClick={() => handleFilterByWeightRange()}
              >
                Filter (Weights Range)
              </span>
            </div>
            {isWeightFilterRangeOpen && (
              <div className="custom-modal">
                <div className="modal-content">
                  <h2>Weights Denoted on Edges </h2>
                  <h4>Please enter the range of weights</h4>
                  <input
                    type="text"
                    placeholder="Minimum weight"
                    value={minValue}
                    onChange={(e) => setMinValue(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Maximum weight"
                    value={maxValue}
                    onChange={(e) => setMaxValue(e.target.value)}
                  />
                  <div className="modal-actions">
                    <button onClick={handleApplyFilterbyWeightRange}>
                      Apply
                    </button>
                    <button onClick={closeWeightModal}>Cancel</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div> */}

        {/* Layout Options Dropdown */}
        {/* <div className="dropdown">
          <span className="dropbtn">Layout Options</span>
          <div className="dropdown-content">
            <button className="layout-btn-doing" onClick={setTreeLayout}>
              Tree
            </button>
            <button className="layout-btn-doing" onClick={setListLayout}>
              List
            </button>
          </div>
        </div> */}
        <ToggleButton
          items={["tree", "list"]}
          defaultItem="tree"
          itemText={(item) => (item === "tree" ? "Tree" : "List")}
          selectedItem={layout}
          onChange={setLayout}
        />

        {/* <div className="dropdown"> */}
        {/* <span className="dropbtn" onClick={() => handleFilterByRange()}>Filter (Range)</span> */}
        {/* </div> */}

        {/* <div className="dropdown">
          <span className="dropbtn" onClick={() => handleReset()}>
            Reset Sorting & Filtering
          </span>
        </div> */}
      </div>

      {/* Legend Display */}
      <div className="legend-container">
        <div className="legend">
          <h3 className="legend-title">Risk Level</h3>
          {legendData.map((item) => (
            <div className="legend-item" key={item.color}>
              <label
                htmlFor={item.category}
                className={`legend-color legend-color-${item.color}`}
              />

              <span className="legend-category">{item.category}</span>
              <span className="legend-range">
                (quality score: {item.range})
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Tree Display */}
      <div className="layout-container">
        {layout === "tree" && (
          <TreeDisplay fileData={dataToUse} reset={reset} />
        )}
        {layout === "list" && <ListDisplay fileData={dataToUse} />}
        <DSSide data={fileData} />
      </div>
    </div>
  );
}
