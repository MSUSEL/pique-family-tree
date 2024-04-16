import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import TreeNode from "./TreeNode/TreeNode";
import NodeRiskColor from "./TreeNode/NodeColorHelper";
import "./TreeDisplay.css";
import NodeDescriptionPanel from "./nodeDescriptionPanel/NodeDescriptionPanel";
import {
  determineDescriptionClickerBorder,
  determineDescriptionClickerColor,
  determineParentClickerBorder,
  determineParentClickerColor,
  findPIQUENode,
} from "./TreeDisplayHelpers";
/**
 * @param fileData PIQUE .json output file.
 */

export function TreeDisplay(props) {
  const [qaChildrenEdgeVisibility, setQAChildrenEdgeVisibility] = useState(
    () => {
      let default_obj = {};
      for (let qa in props.fileData.factors.quality_aspects) {
        default_obj[qa] = false;
      }
      return default_obj;
    }
  );

  const [pfChildrenVisibility, setPFChildrenVisibility] = useState(() => {
    let default_obj = {};
    for (let pf in props.fileData.factors.product_factors) {
      default_obj[pf] = false;
    }
    return default_obj;
  });

  const [measureChildrenVisibility, setMeasureChildrenVisibility] = useState(
    () => {
      let default_obj = {};
      for (let measure in props.fileData.measures) {
        default_obj[measure] = false;
      }
      return default_obj;
    }
  );

  const [pfWithParentsShowing, setPFWithParentsShowing] = useState(() => {
    let pfParentEdges = {};

    for (let qa in props.fileData.factors.quality_aspects) {
      pfParentEdges[qa] = {};
      for (let pf in props.fileData.factors.product_factors) {
        pfParentEdges[qa][pf] = false;
      }
    }
    return pfParentEdges;
  });

  const [pfParentClicked, setPFParentClicked] = useState(null);

  const [measureWithParentsShowing, setMeasureWithParentsShowing] =
    useState(null);
  const [
    measureWithParentsShowingCoordinates,
    setMeasureWithParentsShowingCoordinates,
  ] = useState([]);
  const [measuresWithMultipleParents] = useState(() => {
    let measures = {};
    for (let measure in props.fileData.measures) {
      measures[measure] = 0;
    }
    for (let pf in props.fileData.factors.product_factors) {
      for (let weight in props.fileData.factors.product_factors[pf].weights) {
        measures[weight]++;
      }
    }
    let multipleParentMeasures = {};
    for (let measure in measures) {
      if (measures[measure] > 1) multipleParentMeasures[measure] = true;
    }
    return { ...multipleParentMeasures };
  });

  const [qaImpacts] = useState(() => {
    let qa_impacts = {};
    let qa_impacts_array = [];
    for (let weight in props.fileData.factors.tqi[
      Object.keys(props.fileData.factors.tqi)[0]
    ].weights) {
      qa_impacts_array.push([
        weight,
        props.fileData.factors.tqi[Object.keys(props.fileData.factors.tqi)[0]]
          .weights[weight] *
          (1 - props.fileData.factors.quality_aspects[weight].value),
      ]);
    }
    qa_impacts_array.sort((qa1, qa2) => qa2[1] - qa1[1]);

    for (let item = 0; item < qa_impacts_array.length; item++) {
      qa_impacts[qa_impacts_array[item][0]] = {
        rank: item + 1,
        value: qa_impacts_array[item][1],
      };
    }
    return qa_impacts;
  });

  const [pfImpacts] = useState(() => {
    let pf_impacts = {};
    for (let pf in props.fileData.factors.product_factors) {
      pf_impacts[pf] = 0;
    }
    for (let qa in props.fileData.factors.quality_aspects) {
      for (let weight in props.fileData.factors.quality_aspects[qa].weights) {
        pf_impacts[weight] +=
          ((props.fileData.factors.quality_aspects[qa].weights[weight] *
            (1 - props.fileData.factors.product_factors[weight].value)) /
            (1 - props.fileData.factors.quality_aspects[qa].value)) *
          qaImpacts[qa].value;
      }
    }
    let pf_impacts_array = [];
    for (let pf in pf_impacts) {
      pf_impacts_array.push([pf, pf_impacts[pf]]);
    }
    pf_impacts_array.sort((pf1, pf2) => pf2[1] - pf1[1]);
    for (let item = 0; item < pf_impacts_array.length; item++) {
      pf_impacts[pf_impacts_array[item][0]] = {
        rank: item + 1,
        value: pf_impacts_array[item][1],
      };
    }
    return pf_impacts;
  });

  const [measureImpacts] = useState(() => {
    let m_impacts = {};
    for (let measure in props.fileData.measures) {
      m_impacts[measure] = 0;
    }
    for (let pf in props.fileData.factors.product_factors) {
      for (let weight in props.fileData.factors.product_factors[pf].weights) {
        m_impacts[weight] +=
          ((props.fileData.factors.product_factors[pf].weights[weight] *
            (1 - props.fileData.measures[weight].value)) /
            (1 - props.fileData.factors.product_factors[pf].value)) *
          pfImpacts[pf].value;
      }
    }

    for (let m in m_impacts) {
      if (isNaN(m_impacts[m])) m_impacts[m] = 0; // Hopefully get rid of this in future
    }
    let m_impacts_array = [];
    for (let m in m_impacts) {
      m_impacts_array.push([m, m_impacts[m]]);
    }
    m_impacts_array.sort((m1, m2) => m2[1] - m1[1]);
    for (let item = 0; item < m_impacts_array.length; item++) {
      m_impacts[m_impacts_array[item][0]] = {
        rank: item + 1,
        value: m_impacts_array[item][1],
      };
    }
    return m_impacts;
  });

  const [impacts] = useState({
    "Quality Aspect": qaImpacts,
    "Product Factor": pfImpacts,
    Measure: measureImpacts,
  });

  const [nodesForPanelBoxes, setNodesForPanelBoxes] = useState([]);

  const [width, setWidth] = useState(window.innerWidth);
  // Make height slightly shorter due to SVG element height bug
  const [height, setHeight] = useState(window.innerHeight * 0.75 * 0.99);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);

  const [dragStartCoordinates, setStartDragCoordinates] = useState({
    x: null,
    y: null,
  });
  const [dragging, setDragging] = useState(false);

  const [wantToDrag, setWantToDrag] = useState(false);

  // Setting the dimensions of each node
  const node_width = 120;
  const node_height = 80;

  const tree_canvas = useRef(null);

  useEffect(() => {
    showCanvas();
  });

  const showCanvas = () => {
    // Tree nodes array only contains TQI and quality aspects nodes... maybe change later for clarity?
    let treeNodes = [];

    /**
     * Creating the TQI node and putting its information into treeNodes array
     */

    const tqi_node_x = width / 2 - node_width / 2;
    const tqi_node_y = 15;

    for (let tqi_ in props.fileData.factors.tqi) {
      treeNodes.push(
        new TreeNode(
          props.fileData.factors.tqi[tqi_],
          node_width,
          node_height,
          tqi_node_x,
          tqi_node_y
        )
      );
    }

    /**
     * Creating the quality aspect nodes and putting their information into treeNodes array.
     */

    const num_of_quality_aspects = Object.keys(
      props.fileData.factors.quality_aspects
    ).length;
    const quality_aspect_spacing = node_width * 1.5;

    function calc_quality_aspect_x(iter) {
      let center = width / 2;
      let quality_aspect_total_width =
        num_of_quality_aspects * node_width +
        (num_of_quality_aspects - 1) * quality_aspect_spacing;
      let start_x = center - quality_aspect_total_width / 2;
      return start_x + iter * (node_width + quality_aspect_spacing);
    }

    let item = 0;
    for (let aspect in props.fileData.factors.quality_aspects) {
      treeNodes.push(
        new TreeNode(
          props.fileData.factors.quality_aspects[aspect],
          node_width,
          node_height,
          calc_quality_aspect_x(item++),
          160
        )
      );
    }

    /**
     * Creating the array of product factor node information and putting it into p_factors array.
     * @type {number}
     */

    const p_factor_size_scale = 1;

    const p_factor_width = node_width * p_factor_size_scale;
    const p_factor_height = node_height * p_factor_size_scale;
    const p_factor_y = 450;

    const num_of_p_factors = Object.keys(
      props.fileData.factors.quality_aspects[
        Object.keys(props.fileData.factors.quality_aspects)[0]
      ].weights
    ).length;

    const p_factor_spacing = p_factor_width * 0.5;

    const calc_p_factor_x = (iter) => {
      let center = width / 2;
      let p_factor_total_width =
        num_of_p_factors * p_factor_width +
        (num_of_p_factors - 1) * p_factor_spacing;
      let start_x = center - p_factor_total_width / 2;
      return start_x + iter * (p_factor_width + p_factor_spacing);
    };

    let p_factors = [];

    let p_factor_num = 0;
    for (let p_factor in props.fileData.factors.product_factors) {
      p_factors.push(
        new TreeNode(
          props.fileData.factors.product_factors[p_factor],
          p_factor_width,
          p_factor_height,
          calc_p_factor_x(p_factor_num++),
          p_factor_y
        )
      );
    }

    /**
     * Important piece
     * This removes the svg canvas before creating the new one, because without this
     * the svg's will continue to stack onto each other.
     */
    d3.select(tree_canvas.current).selectAll("svg").remove();

    /**
     * Creating the zoom features for the tree display.
     */
    const zoom = (e) => {
      if (e.deltaY < 0) zoomIn();
      else zoomOut();
    };
    const zoomIn = () => {
      setWidth((width) => (9 * width) / 10);
      setHeight((height) => (9 * height) / 10);
    };
    const zoomOut = () => {
      setWidth((width) => (10 * width) / 9);
      setHeight((height) => (10 * height) / 9);
    };

    /**
     * Begin creating the entire svg.
     */

    const svg = d3
      .select(tree_canvas.current)
      .attr("id", "canvas")
      .append("svg")
      .attr("viewBox", `${x} ${y} ${width} ${height}`)
      .on("mousewheel", zoom)
      .style("vertical-align", "top");

    /**
     * Methods that handle the dragging feature of the display.
     */
    const dragMove = (e) => {
      const diff_x = e.screenX - dragStartCoordinates.x;
      const diff_y = e.screenY - dragStartCoordinates.y;

      let dragStartCorsCopy = dragStartCoordinates;
      dragStartCorsCopy.x = e.screenX;
      dragStartCorsCopy.y = e.screenY;

      setStartDragCoordinates({ ...dragStartCorsCopy });

      setX((x) => x - diff_x);
      setY((y) => y - diff_y);
    };

    if (dragging) {
      d3.select("svg").on("mousemove", dragMove);
    }

    const handleSVGMouseDown = (e) => {
      e.preventDefault();

      let dragStartCorsCopy = dragStartCoordinates;

      dragStartCorsCopy.x = e.screenX;
      dragStartCorsCopy.y = e.screenY;

      setStartDragCoordinates({ ...dragStartCorsCopy });
      setDragging(true);
    };

    const handleSVGMouseUp = () => {
      setDragging(false);
    };

    if (wantToDrag) {
      d3.select("svg").on("mousedown", handleSVGMouseDown);
    }

    d3.select("svg").on("mouseup", handleSVGMouseUp);

    /** -----------------------------------------------------------------------
     * Begin drawing the edges of the svg so that they are on the
     * "bottom" of the display and the nodes are placed over the edges.
     * -----------------------------------------------------------------------*/

    /**
     * Drawing the edges between the TQI node and the quality factor nodes.
     */
    for (let item = 1; item < treeNodes.length; item++) {
      treeNodes[0].children.push(treeNodes[item].name);
      const link = d3.linkHorizontal()({
        // Changes source/target so that the edge weight text is on top of the path line.
        source:
          treeNodes[0].node_center_x < treeNodes[item].node_center_x
            ? [treeNodes[0].node_center_x, treeNodes[0].node_center_y]
            : [treeNodes[item].node_center_x, treeNodes[item].y + 2],
        target:
          treeNodes[0].node_center_x < treeNodes[item].node_center_x
            ? [treeNodes[item].node_center_x, treeNodes[item].y + 2]
            : [treeNodes[0].node_center_x, treeNodes[0].node_center_y], // add a couple pixels so link is under node
      });

      svg
        .append("path")
        .attr("id", "tqi_" + treeNodes[item].name + "_edge" + item)
        .attr("d", link)
        .attr("stroke-width", "1px")
        .attr("stroke", "black")
        .attr("fill", "none");

      svg
        .append("text")
        .attr("text-orientation", "upright")
        .attr("dy", "-3")
        .attr("font-weight", "bold")
        .append("textPath")
        .attr(
          "startOffset",
          `${
            treeNodes[0].node_center_x < treeNodes[item].node_center_x ? 50 : 30
          }%`
        )
        .attr("font-size", "10px")
        .attr("xlink:href", "#tqi_" + treeNodes[item].name + "_edge" + item)
        .text(
          Object.values(treeNodes[0].json_data.weights)[item - 1].toFixed(2)
        );
    }

    /**
     * Drawing the edges between the quality factor nodes and the product factor nodes.
     */
    for (let aspect = 1; aspect < treeNodes.length; aspect++) {
      for (let factor = 0; factor < p_factors.length; factor++) {
        const link = d3.linkHorizontal()({
          source:
            treeNodes[aspect].node_center_x < p_factors[factor].node_center_x
              ? [
                  treeNodes[aspect].node_center_x,
                  treeNodes[aspect].node_center_y,
                ]
              : [p_factors[factor].node_center_x, p_factors[factor].y + 2],
          target:
            treeNodes[aspect].node_center_x < p_factors[factor].node_center_x
              ? [p_factors[factor].node_center_x, p_factors[factor].y + 2]
              : [
                  treeNodes[aspect].node_center_x,
                  treeNodes[aspect].node_center_y,
                ], // add a couple pixels so link is under node
        });

        svg
          .append("path")
          .attr("id", treeNodes[aspect].name + "_edge" + factor)
          .attr("d", link)
          .attr("stroke-width", "1px")
          .attr("stroke", "black")
          .attr(
            "opacity",
            `${
              qaChildrenEdgeVisibility[treeNodes[aspect].name] ||
              pfWithParentsShowing[treeNodes[aspect].name][
                p_factors[factor].name
              ]
                ? 1
                : 0 // initial 0.05, change to 0
            }`
          )
          .attr("fill", "none");

        if (
          qaChildrenEdgeVisibility[treeNodes[aspect].name] ||
          pfWithParentsShowing[treeNodes[aspect].name][p_factors[factor].name]
        ) {
          svg
            .append("text")
            .attr("text-orientation", "upright")
            .attr("dy", "-3")
            .attr("font-weight", "bold")
            .append("textPath")
            .attr(
              "startOffset",
              `${
                treeNodes[aspect].node_center_x <
                p_factors[factor].node_center_x
                  ? 50
                  : 35
              }%`
            )
            .attr("font-size", "10px")
            .attr("xlink:href", "#" + treeNodes[aspect].name + "_edge" + factor)
            .text(
              treeNodes[aspect].json_data.weights[
                p_factors[factor].name
              ].toFixed(2)
            );
        }
      }
    }

    /**
     * Handle clicking a quality aspect node
     */

    //All browsers did an update in Jan 2023 that removed event.path and event.composedPath
    //from their nonstandard libraries. The follow lines of code will override that
    //and allow you to continue to use the path and composedPath libraries
    if (!Event.prototype.hasOwnProperty("path")) {
      Object.defineProperty(Event.prototype, "path", {
        get() {
          return this.composedPath();
        },
      });
    }

    const handleQAEdgesToggle = (e) => {
      const qa_name = e.path[0].id.split("^")[1];

      let qaChildrenEdgeVisibilityCopy = qaChildrenEdgeVisibility;

      const toggle_to = qaChildrenEdgeVisibilityCopy[qa_name] === false;
      for (let name in qaChildrenEdgeVisibilityCopy) {
        qaChildrenEdgeVisibilityCopy[name] = false;
      }
      qaChildrenEdgeVisibilityCopy[qa_name] = toggle_to;

      setQAChildrenEdgeVisibility({ ...qaChildrenEdgeVisibilityCopy });
    };

    /**
     * Creating the TQI and quality factor nodes in the treeDisplay display.
     */
    // TQI node
    // add a white background color for tqi
    svg
      .append("rect")
      .attr("id", "tqi^" + treeNodes[0].name)
      .attr("width", treeNodes[0].width)
      .attr("height", treeNodes[0].height)
      .attr("rx", 2)
      .attr("x", treeNodes[0].x)
      .attr("y", treeNodes[0].y)
      .style("fill", "white");

    svg
      .append("rect")
      .attr("id", "tqi^" + treeNodes[0].name)
      .attr("width", treeNodes[0].width)
      .attr("height", treeNodes[0].height)
      .attr("rx", 2)
      .attr("x", treeNodes[0].x)
      .attr("y", treeNodes[0].y)
      .style("fill", NodeRiskColor(treeNodes[0].json_data.value))
      .style("stroke-width", "2px")
      .style("stroke", "black");

    svg
      .append("text")
      .text(treeNodes[0].name)
      .attr("font-size", "10px")
      .attr("font-weight", "bold")
      .attr("x", treeNodes[0].x + node_width * 0.5)
      .attr("y", treeNodes[0].y + node_height * 0.4)
      .attr("fill", "black")
      .attr("dominant-baseline", "middle")
      .attr("text-anchor", "middle");

    svg
      .append("text")
      .text(treeNodes[0].json_data.value.toFixed(4))
      .attr("font-size", "12px")
      .attr("x", treeNodes[0].x + node_width * 0.5)
      .attr("y", treeNodes[0].y + node_height * 0.6)
      .attr("fill", "black")
      .attr("dominant-baseline", "middle")
      .attr("text-anchor", "middle");

    // Quality aspect nodes
    for (let item = 1; item < treeNodes.length; item++) {
      // add the white background color for 2nd level nodes to hide edges behhind the rect
      svg
        .append("rect")
        .attr("id", "quality_aspects^" + treeNodes[item].name)
        .attr("width", treeNodes[item].width)
        .attr("height", treeNodes[item].height)
        .attr("rx", 2)
        .attr("x", treeNodes[item].x)
        .attr("y", treeNodes[item].y)
        .style("fill", "white");

      svg
        .append("rect")
        .attr("id", "quality_aspects^" + treeNodes[item].name)
        .attr("width", treeNodes[item].width)
        .attr("height", treeNodes[item].height)
        .attr("rx", 2)
        .attr("x", treeNodes[item].x)
        .attr("y", treeNodes[item].y)
        .style("fill", NodeRiskColor(treeNodes[item].json_data.value))
        .style("stroke-width", "2px")
        .style("stroke", "black")
        .on("click", handleQAEdgesToggle);

      svg
        .append("text")
        .text(treeNodes[item].name)
        .attr("font-size", "10px")
        .attr("font-weight", "bold")
        .attr("x", treeNodes[item].x + node_width * 0.5)
        .attr("y", treeNodes[item].y + node_height * 0.4)
        .attr("fill", "black")
        .attr("dominant-baseline", "middle")
        .attr("text-anchor", "middle");

      svg
        .append("text")
        .text(treeNodes[item].json_data.value.toFixed(4))
        .attr("font-size", "12px")
        .attr("x", treeNodes[item].x + node_width * 0.5)
        .attr("y", treeNodes[item].y + node_height * 0.6)
        .attr("fill", "black")
        .attr("dominant-baseline", "middle")
        .attr("text-anchor", "middle");
    }

    const findProductFactor = (name) => {
      for (let pf in p_factors) {
        if (p_factors[pf].name === name) return p_factors[pf];
      }
    };

    const handlePFEdgesToggle = (e) => {
      // Changed const to let
      let pf_node = findProductFactor(e.path[0].id.split("^")[1]);

      let pfChildrenVisibilityCopy = pfChildrenVisibility;

      const toggle_to = !pfChildrenVisibilityCopy[pf_node.name];
      for (let prop in pfChildrenVisibilityCopy) {
        pfChildrenVisibilityCopy[prop] = false;
      }
      pfChildrenVisibilityCopy[pf_node.name] = toggle_to;

      setPFChildrenVisibility({ ...pfChildrenVisibilityCopy });
    };

    const handleMeasureEdgesToggle = (e) => {
      const measure_name = e.path[0].id.split("^")[1];

      let measureChildrenVisibilityCopy = measureChildrenVisibility;
      measureChildrenVisibilityCopy[measure_name] =
        !measureChildrenVisibilityCopy[measure_name];
      setMeasureChildrenVisibility({ ...measureChildrenVisibilityCopy });
    };

    /**
     * Creating the measure nodes in the treeDisplay display.
     */

    // Create measure parent links if applicable
    if (measureWithParentsShowing !== null) {
      const measure_mid_x =
        measureWithParentsShowingCoordinates[0] + node_width / 2;
      const measure_y_cor = measureWithParentsShowingCoordinates[1];

      // Find product factors that use the measure as a weight
      let parents = [];

      for (let pf in props.fileData.factors.product_factors) {
        for (let weight in props.fileData.factors.product_factors[pf].weights) {
          // Make another state object to optimize this.
          if (weight === measureWithParentsShowing) parents.push(pf);
        }
      }

      // Need to filter for only product factors that use the measure as a weight
      for (let pf in p_factors) {
        if (
          parents.includes(p_factors[pf].name) &&
          !pfChildrenVisibility[p_factors[pf].name]
        ) {
          const link = d3.linkHorizontal()({
            source:
              p_factors[pf].node_center_x < measure_mid_x
                ? [p_factors[pf].node_center_x, p_factors[pf].node_center_y]
                : [measure_mid_x, measure_y_cor + 2],
            target:
              p_factors[pf].node_center_x < measure_mid_x
                ? [measure_mid_x, measure_y_cor + 2]
                : [p_factors[pf].node_center_x, p_factors[pf].node_center_y],
          });

          // Drawing the link between measure and product factor parents
          svg
            .append("path")
            .attr(
              "id",
              measureWithParentsShowing + "_parentEdge" + p_factors[pf].name
            )
            .attr("d", link)
            .attr("stroke-width", "1px")
            .attr("stroke", "black")
            .attr("fill", "none");

          svg
            .append("text")
            .attr("text-orientation", "upright")
            .attr("dy", "-3")
            .attr("font-weight", "bold")
            .append("textPath")
            .attr(
              "startOffset",
              `${
                p_factors[pf].node_center_x < measure_mid_x
                  ? 60
                  : p_factors[pf].node_center_x > measure_mid_x
                  ? 30
                  : 25
              }%`
            )
            .attr("font-size", "8px")
            .attr(
              "xlink:href",
              "#" +
                measureWithParentsShowing +
                "_parentEdge" +
                p_factors[pf].name
            )
            .text(
              p_factors[pf].json_data.weights[
                measureWithParentsShowing
              ].toFixed(2)
            );
        }
      }
    }

    for (let pf = 0; pf < p_factors.length; pf++) {
      if (pfChildrenVisibility[p_factors[pf].name]) {
        const num_of_measures = Object.entries(
          p_factors[pf].json_data.weights
        ).length;
        const measure_spacing = node_width * 0.5;
        const total_measure_length =
          num_of_measures * node_width +
          (num_of_measures - 1) * measure_spacing;

        const start_x = p_factors[pf].node_center_x - total_measure_length / 2;

        let iter = 0;
        for (let measure_name in p_factors[pf].json_data.weights) {
          let x_cor = start_x + iter * (node_width + measure_spacing);
          let mid_x = x_cor + node_width * 0.5;
          let y_cor = p_factor_y + p_factor_height + 80;

          const link = d3.linkHorizontal()({
            source:
              p_factors[pf].node_center_x < mid_x
                ? [p_factors[pf].node_center_x, p_factors[pf].node_center_y]
                : [mid_x, y_cor + 2],
            target:
              p_factors[pf].node_center_x < mid_x
                ? [mid_x, y_cor + 2]
                : [p_factors[pf].node_center_x, p_factors[pf].node_center_y], // add a couple pixels so link is under node
          });

          // Drawing the link between product factor and measure
          svg
            .append("path")
            .attr("id", p_factors[pf].name + "_edge" + iter)
            .attr("d", link)
            .attr("stroke-width", "1px")
            .attr("stroke", "black")
            .attr("fill", "none");

          svg
            .append("text")
            .attr("text-orientation", "upright")
            .attr("dy", "-3")
            .attr("font-weight", "bold")
            .append("textPath")
            .attr(
              "startOffset",
              `${
                p_factors[pf].node_center_x < mid_x
                  ? 50
                  : p_factors[pf].node_center_x > mid_x
                  ? 35
                  : 25
              }%`
            )
            .attr("font-size", "8px")
            .attr("xlink:href", "#" + p_factors[pf].name + "_edge" + iter)
            .text(p_factors[pf].json_data.weights[measure_name].toFixed(2));

          // ---------------------------------------------------
          /**
           * Draw the diagnostics for a measure.
           */
          if (measureChildrenVisibility[measure_name]) {
            let measure_weights = [];

            for (let diagnostic in props.fileData.measures[measure_name]
              .weights) {
              measure_weights.push(diagnostic);
            }

            const num_of_weights = Object.entries(
              props.fileData.measures[measure_name].weights
            ).length;
            const diag_spacing = node_width * 0.5;
            const total_diag_length =
              num_of_weights * node_width + (num_of_weights - 1) * diag_spacing;
            const start_x = x_cor - total_diag_length / 2 + node_width / 2;
            const diag_y = y_cor + node_height * 2;

            const measure_center_x = x_cor + node_width / 2;
            const measure_center_y = y_cor + node_height / 2;

            const calc_diag_x = (iter) => {
              return start_x + iter * (node_width + diag_spacing);
            };

            let i = 0;
            for (let diagnostic in measure_weights) {
              const diagnostic_name = measure_weights[diagnostic];

              const link = d3.linkHorizontal()({
                source:
                  measure_center_x < calc_diag_x(i) + node_width / 2
                    ? [measure_center_x, measure_center_y]
                    : [calc_diag_x(i) + node_width / 2, diag_y + 2],
                target:
                  measure_center_x < calc_diag_x(i) + node_width / 2
                    ? [calc_diag_x(i) + node_width / 2, diag_y + 2]
                    : [measure_center_x, measure_center_y], // add a couple pixels so link is under node
              });

              // Drawing the link between measure and diagnostic
              svg
                .append("path")
                .attr("id", measure_name + "_edge" + iter)
                .attr("d", link)
                .attr("stroke-width", "1px")
                .attr("stroke", "black")
                .attr("fill", "none");

              svg
                .append("text")
                .attr("text-orientation", "upright")
                .attr("dy", "-3")
                .attr("font-weight", "bold")
                .append("textPath")
                .attr("startOffset", "25%")
                .attr("font-size", "8px")
                .attr("xlink:href", "#" + measure_name + "_edge" + iter)
                .text(
                  props.fileData.measures[measure_name].weights[
                    diagnostic_name
                  ].toFixed(2)
                );

              const diag_x = calc_diag_x(i);
              // add the white background color to hide behind edges
              svg
                .append("rect")
                .attr(
                  "id",
                  "diagnostics^" +
                    props.fileData["diagnostics"][diagnostic_name].name
                )
                .attr("width", node_width)
                .attr("height", node_height)
                .attr("rx", 2)
                .attr("x", diag_x)
                .attr("y", diag_y)
                .style("fill", "white");

              svg
                .append("rect")
                .attr(
                  "id",
                  "diagnostics^" +
                    props.fileData["diagnostics"][diagnostic_name].name
                )
                .attr("width", node_width)
                .attr("height", node_height)
                .attr("rx", 2)
                .attr("x", diag_x)
                .attr("y", diag_y)
                .style(
                  "fill",
                  NodeRiskColor(
                    props.fileData["diagnostics"][diagnostic_name].value,
                    "diagnostic"
                  )
                )
                .style("stroke-width", "1px")
                .style("stroke", "black");

              svg
                .append("text")
                .text(props.fileData["diagnostics"][diagnostic_name].name)
                .attr("font-size", "9px")
                .attr("font-weight", "bold")
                .attr("x", diag_x + node_width * 0.5)
                .attr("y", diag_y + node_height * 0.4)
                .attr("fill", "black")
                .attr("dominant-baseline", "middle")
                .attr("text-anchor", "middle");

              svg
                .append("text")
                .text(
                  props.fileData["diagnostics"][diagnostic_name].value.toFixed(
                    4
                  )
                )
                .attr("font-size", "11px")
                .attr("x", diag_x + node_width * 0.5)
                .attr("y", diag_y + node_height * 0.6)
                .attr("fill", "black")
                .attr("dominant-baseline", "middle")
                .attr("text-anchor", "middle");

              i++;
            }
          }

          /**
           * Draw the measure nodes for the associated product factor.
           */
          // add white bgc
          svg
            .append("rect")
            .attr(
              "id",
              "measures^" + props.fileData.measures[measure_name].name
            )
            .attr("width", node_width)
            .attr("height", node_height)
            .attr("rx", 2)
            .attr("x", x_cor)
            .attr("y", y_cor)
            .style("fill", "white");

          svg
            .append("rect")
            .attr(
              "id",
              "measures^" + props.fileData.measures[measure_name].name
            )
            .attr("width", node_width)
            .attr("height", node_height)
            .attr("rx", 2)
            .attr("x", x_cor)
            .attr("y", y_cor)
            .style(
              "fill",
              NodeRiskColor(props.fileData.measures[measure_name].value)
            )
            .style("stroke-width", "1px")
            .style("stroke", "black")
            .on("click", handleMeasureEdgesToggle);

          svg
            .append("text")
            .text(props.fileData.measures[measure_name].name)
            .attr("font-size", "9px")
            .attr("font-weight", "bold")
            .attr("x", x_cor + node_width * 0.5)
            .attr("y", y_cor + node_height * 0.4)
            .attr("fill", "black")
            .attr("dominant-baseline", "middle")
            .attr("text-anchor", "middle");

          svg
            .append("text")
            .text(props.fileData.measures[measure_name].value.toFixed(4))
            .attr("font-size", "11px")
            .attr("x", x_cor + node_width * 0.5)
            .attr("y", y_cor + node_height * 0.6)
            .attr("fill", "black")
            .attr("dominant-baseline", "middle")
            .attr("text-anchor", "middle");

          iter++;
        }
      }
    }

    /**
     * Creating the product factor nodes in the treeDisplay display.
     */
    for (let i = 0; i < p_factors.length; i++) {
      // add white bgc
      svg
        .append("rect")
        .attr("id", "product_factors^" + p_factors[i].name)
        .attr("width", p_factors[i].width)
        .attr("height", p_factors[i].height)
        .attr("rx", 2)
        .attr("x", p_factors[i].x)
        .attr("y", p_factors[i].y)
        .style("fill", "white");

      svg
        .append("rect")
        .attr("id", "product_factors^" + p_factors[i].name)
        .attr("width", p_factors[i].width)
        .attr("height", p_factors[i].height)
        .attr("rx", 2)
        .attr("x", p_factors[i].x)
        .attr("y", p_factors[i].y)
        .style("fill", NodeRiskColor(p_factors[i].json_data.value))
        .style("stroke-width", "1px")
        .style("stroke", "black")
        .on("click", handlePFEdgesToggle);

      svg
        .append("text")
        .text(p_factors[i].name)
        .attr("font-size", "9px")
        .attr("font-weight", "bold")
        .attr("x", p_factors[i].x + p_factor_width * 0.5)
        .attr("y", p_factors[i].y + p_factor_height * 0.4)
        .attr("fill", "black")
        .attr("dominant-baseline", "middle")
        .attr("text-anchor", "middle");

      svg
        .append("text")
        .text(p_factors[i].json_data.value.toFixed(4))
        .attr("font-size", "11px")
        .attr("x", p_factors[i].x + p_factor_width * 0.5)
        .attr("y", p_factors[i].y + p_factor_height * 0.6)
        .attr("fill", "black")
        .attr("dominant-baseline", "middle")
        .attr("text-anchor", "middle");
    }
    const handleClickingNodeForDescriptionPanel = (e) => {
      let nfpa = nodesForPanelBoxes;

      const clicked_id_name = e.path[0].id.split("^")[2];

      if (
        nodesForPanelBoxes.filter((n) => n["name"] === clicked_id_name).length >
        0
      ) {
        nfpa = nfpa.filter((e) => e.name !== clicked_id_name);
      } else {
        nfpa = [...nfpa, findPIQUENode(props.fileData, e.path[0].id)];
      }
      setNodesForPanelBoxes(nfpa);
    };

    const handleClickingPFParentClicker = (e) => {
      //console.log(e.path[0].id)

      const clicked_id_name = e.path[0].id.split("^")[2];

      let pf = pfWithParentsShowing;

      if (pfParentClicked === null) setPFParentClicked(clicked_id_name);
      else {
        if (pfParentClicked !== clicked_id_name) {
          for (let qa in pf) {
            pf[qa][pfParentClicked] = false;
          }
          setPFParentClicked(clicked_id_name);
        } else setPFParentClicked(null);
      }

      for (let qa in pf) {
        pf[qa][clicked_id_name] = !pf[qa][clicked_id_name];
      }
      setPFWithParentsShowing({ ...pf });
    };

    const handleClickingMParentClicker = (e) => {
      console.log(e.path[0].id);
      //
      let clicked_id_name = e.path[0].id.split("^")[2];

      if (measureWithParentsShowing === clicked_id_name) {
        setMeasureWithParentsShowing(null);
        setMeasureWithParentsShowingCoordinates([]);
      } else {
        setMeasureWithParentsShowing(clicked_id_name);
        const measure = [...d3.selectAll("rect")._groups[0]].filter(
          (node) => node.id.split("^")[1] === clicked_id_name
        );
        setMeasureWithParentsShowingCoordinates([
          parseFloat(measure[0].attributes.x.value),
          parseFloat(measure[0].attributes.y.value),
        ]);
      }
    };

    /**
     * Making the clicker boxes in the top corners of each node where, when clicked,
     * will either add the node's information to the side panel in the display or
     * show node's edges to its parents.
     */
    const nodes = d3.selectAll("rect")._groups[0];
    const num_of_nodes = nodes.length;

    for (let i = 0; i < num_of_nodes; i++) {
      const x = nodes[i].x.animVal.value;
      const y = nodes[i].y.animVal.value;
      const width = nodes[i].width.animVal.value;
      const height = nodes[i].height.animVal.value;

      svg
        .append("rect")
        .attr("id", "description_clicker^" + nodes[i].id)
        .attr("width", width / 8)
        .attr("height", width / 8)
        .attr("rx", 2)
        .attr("x", x + (27 * width) / 32)
        .attr("y", y + height / 20)
        .style(
          "fill",
          determineDescriptionClickerColor(nodesForPanelBoxes, nodes[i].id)
        )
        .style("stroke-width", "1px")
        .style(
          "stroke",
          determineDescriptionClickerBorder(nodesForPanelBoxes, nodes[i].id)
        )
        .on("click", handleClickingNodeForDescriptionPanel);

      const node_type = nodes[i].id.split("^")[0];
      if (
        node_type === "product_factors" ||
        (node_type === "measures" &&
          measuresWithMultipleParents.hasOwnProperty(nodes[i].id.split("^")[1]))
      ) {
        svg
          .append("rect")
          .attr("id", "parents_clicker^" + nodes[i].id)
          .attr("width", width / 8)
          .attr("height", width / 8)
          .attr("rx", 10)
          .attr("x", x + width / 32)
          .attr("y", y + height / 20)
          .style(
            "fill",
            determineParentClickerColor(
              node_type === "product_factors"
                ? pfParentClicked
                : measureWithParentsShowing,
              nodes[i].id
            )
          )
          .style("stroke-width", "1px")
          .style(
            "stroke",
            determineParentClickerBorder(
              node_type === "product_factors"
                ? pfParentClicked
                : measureWithParentsShowing,
              nodes[i].id
            )
          )
          .on(
            "click",
            node_type === "product_factors"
              ? handleClickingPFParentClicker
              : handleClickingMParentClicker
          );
      }
    }

    /**
     * Helper functions for the drag feature of the display.
     */
    const handleNodeMouseEnter = () => {
      setWantToDrag(false);
    };

    const handleNodeMouseLeave = () => {
      setWantToDrag(true);
    };

    const handleMouseHoveringInBody = () => {
      setWantToDrag(true);
    };

    d3.select("body").on("mouseenter", handleMouseHoveringInBody);

    d3.selectAll("rect")
      .on("mouseenter", handleNodeMouseEnter)
      .on("mouseleave", handleNodeMouseLeave);
  };

  // Reset tree display to x,y,width,height when initially opening it.
  const resetTreeView = () => {
    setWidth(
      nodesForPanelBoxes.length > 0
        ? (window.innerWidth * 65) / 100
        : window.innerWidth
    );
    setHeight(window.innerHeight * 0.75 * 0.99); // Original code before flexbox
    //setHeight(window_height);   // Code with flexbox
    setX(0);
    setY(0);
  };

  // Reset any children visible, edges showing, etc.
  const resetTreeDisplay = () => {
    setQAChildrenEdgeVisibility(() => {
      let obj = qaChildrenEdgeVisibility;
      for (let qa in obj) {
        obj[qa] = false;
      }
      return obj;
    });
    setPFChildrenVisibility(() => {
      let obj = qaChildrenEdgeVisibility;
      for (let pf in obj) {
        obj[pf] = false;
      }
      return obj;
    });
    setMeasureChildrenVisibility(() => {
      let obj = qaChildrenEdgeVisibility;
      for (let m in obj) {
        obj[m] = false;
      }
      return obj;
    });

    setPFWithParentsShowing(() => {
      let pfParentEdges = {};
      for (let qa in props.fileData.factors.quality_aspects) {
        pfParentEdges[qa] = {};
        for (let pf in props.fileData.factors.product_factors) {
          pfParentEdges[qa][pf] = false;
        }
      }
      return pfParentEdges;
    });

    setPFParentClicked(null);

    setMeasureWithParentsShowing(null);
    setMeasureWithParentsShowingCoordinates([]);
  };

  const clearSidePanel = () => {
    setNodesForPanelBoxes([]);
  };

  // Adjusts SVG when node description panel opens up or close.
  // TODO: Come back to this and fix this bug - running into missing depencencies

  useEffect(() => {
    if (nodesForPanelBoxes.length === 1 || nodesForPanelBoxes.length === 0)
      adjustSVGForWindowResize();
  }, [nodesForPanelBoxes.length]);

  useEffect(() => {
    setMeasureWithParentsShowing(null);
    setMeasureWithParentsShowingCoordinates([]);
  }, [pfChildrenVisibility]);

  useEffect(() => {
    if (measureWithParentsShowing) {
      const measure = [...d3.selectAll("rect")._groups[0]].filter(
        (node) => node.id.split("^")[1] === measureWithParentsShowing
      );
      setMeasureWithParentsShowingCoordinates([
        parseFloat(measure[0].attributes.x.value),
        parseFloat(measure[0].attributes.y.value),
      ]);
    }
  }, [width, height]);

  // Adjust SVG when window is resized.
  const adjustSVGForWindowResize = () => {
    setWidth(
      window.innerWidth * (nodesForPanelBoxes.length > 0 ? 65 / 100 : 1)
    );
    setHeight(window.innerHeight * 0.75 * 0.99);
  };

  window.onresize = () => {
    adjustSVGForWindowResize();
  };

  return (
    <>
      <div id={"canvas_container"}>
        <div id={"tree_canvas"} ref={tree_canvas}></div>
        {nodesForPanelBoxes.length > 0 ? (
          <NodeDescriptionPanel nodes={nodesForPanelBoxes} impacts={impacts} />
        ) : null}
      </div>

      <div id={"reset_tree_buttons_div"}>
        <button className={"reset_buttons"} onClick={resetTreeView}>
          Reset Zoom
        </button>
        <button className={"reset_buttons"} onClick={resetTreeDisplay}>
          Reset Selection
        </button>
        {nodesForPanelBoxes.length > 0 ? (
          <button className={"reset_buttons"} onClick={clearSidePanel}>
            Clear Side Panel
          </button>
        ) : null}
      </div>
    </>
  );
}
