// project imports
import TreeNode from "./TreeNode/TreeNode.jsx";
import "./TreeDisplay.css";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  process_data,
  draw_edges,
  draw_up_edges,
} from "./TreeDisplayHelpers.tsx";
import { EyeOpenIcon, EyeClosedIcon, ArrowUpIcon } from "@radix-ui/react-icons";
import NodeDescriptionPanel from "./nodeDescriptionPanel/NodeDescriptionPanel";
import { useProcessedData } from "../../data/useProcessedData";
import { useAtomValue } from "jotai";
import { State } from "../../state";
import * as d3 from "d3";
import "./nodeDescriptionPanel/NodeDescriptionPanel.css";

const canvas_width = 8000;
const node_width = 120;
const node_height = 60;

export const TreeDisplay_Rework_Usememo = () => {
  const dataset = useAtomValue(State.dataset);
  const processedData = useProcessedData();

  // Node positions
  const nodePositions = useMemo(() => {
    const tqi_y = 70;
    const node_y_spacing = 200;
    return {
      tqi_y,
      quality_aspect_y: tqi_y + node_y_spacing,
      product_factor_y: tqi_y + 2 * node_y_spacing,
      measure_y: tqi_y + 3 * node_y_spacing,
      diagnostic_y: tqi_y + 4 * node_y_spacing,
    };
  }, []);

  // Nodes setup
  const { tqiNodes, qualityAspectNodes, productFactorNodes, measureNodes, diagnosticNodes } = useMemo(() => {
    return {
      tqiNodes: create_nodes(processedData.factors.tqi, canvas_width / 2, nodePositions.tqi_y, false),
      qualityAspectNodes: create_nodes(processedData.factors.quality_aspects, canvas_width / 2, nodePositions.quality_aspect_y, false),
      productFactorNodes: create_nodes(processedData.factors.product_factors, canvas_width / 2, nodePositions.product_factor_y, true),
      measureNodes: create_nodes(processedData.measures, activeProductFactorNode.x + 75, nodePositions.measure_y, false),
      diagnosticNodes: create_nodes(processedData.diagnostics, activeMeasureNode.x + 75, nodePositions.diagnostic_y, false)
    };
  }, [processedData, nodePositions, activeProductFactorNode, activeMeasureNode]);

  // Edge drawing using useMemo
  const { tqiEdges, qualityAspectEdges, productFactorEdges, measureEdges } = useMemo(() => {
    return {
      tqiEdges: draw_edges(activeTQINode, qualityAspectNodes),
      qualityAspectEdges: draw_edges(activeQualityAspectNode, productFactorNodes),
      productFactorEdges: draw_edges(activeProductFactorNode, measureNodes),
      measureEdges: draw_edges(activeMeasureNode, diagnosticNodes)
    };
  }, [activeTQINode, activeQualityAspectNode, activeProductFactorNode, activeMeasureNode, qualityAspectNodes, productFactorNodes, measureNodes, diagnosticNodes]);

  // SVG Refs for D3 zoom behavior
  const svgRef = useRef();
  const zoomBehavior = useMemo(() => {
    return d3.zoom().scaleExtent([0.5, 4]).on("zoom", (event) => {
      d3.select(svgRef.current).attr("transform", event.transform);
    });
  }, []);

  // Render function for nodes and edges
  const renderContent = () => (
    <svg ref={svgRef} width={canvas_width} height={nodePositions.diagnostic_y + 70}>
      <g>
        {tqiNodes.map(node => node.render())}
        {qualityAspectNodes.map(node => node.render())}
        {productFactorNodes.map(node => node.render())}
        {measureNodes.map(node => node.render())}
        {diagnosticNodes.map(node => node.render())}
        {tqiEdges}
        {qualityAspectEdges}
        {productFactorEdges}
        {measureEdges}
      </g>
    </svg>
  );

  return (
    <div id="canvas_container">
      <div id="tree_canvas">
        {renderContent()}
        {nodesForPanelBoxes.length > 0 && <NodeDescriptionPanel nodes={nodesForPanelBoxes} />}
      </div>
    </div>
  );
};
