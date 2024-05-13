// project imports
import TreeNode from "./TreeNode/TreeNode.jsx";
import './TreeDisplay.css';
import { CornerTopRightIcon } from '@radix-ui/react-icons';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';
import {process_data, draw_edges} from './TreeDisplayHelpers.tsx'
import { boolean } from "zod";
import { update } from "ramda";
import { create } from "d3";


// TODO:
//    - drag nodes                                              ** I need a way to grab the updated x and y coords of the <draggable>
//    - drag page around
//    - measures nodes
//    - diagnostics nodes
//    - differentiate between types of nodes
//    - edge weights                                            ** done ** 
//    - edit edge weights
//    - edit node values
//    - add up arrow and close eye icon to nodes
//    - horizontal and vertical scroll bars to tree canvas      ** need to center horizontal bar upon loading ** 
//    - reset zoom functionality
//    - reset selection button
//    - quick actions button
//    - click on node to activate its edges to it's children    ** done **


//    - d3/visx panning/scrolling/zooming
//    - react gesture for dragging
//    - usestate/usememo/usecallback/useeffect

const node_width = 120;
const node_height = 60;

const min_width = 400; // the min width at which to render the tree
let width = 10000; // width of the background
let height = 1000; // height of the background

//export default function Example({ width, height, margin = defaultMargin }: TreeProps) { // original
export function TreeDisplay_Rework(_processedData : any) {

  // notes about the tree:
  //    Despite being called a tree, the linkage is different than lets say a BST.
  //    This is because each nodes does not have a list of children, rather, its children
  //    is the entirety of the row of nodes below it. For this reason, each node does
  //    not store a list of its children, only the information about itself.
  //    This is why instead of having one central list of all nodes, I broke it each layer
  //    of nodes up into it's own list. 
  //    From top to bottom: tqi -> quality_aspects -> product_factors



  // Define state variables to manage dynamic aspects
  const [tqi_nodes, setTQINodes] = useState<any[]>([]);
  const [quality_aspect_nodes, setQualityAspectNodes] = useState<any[]>([]);
  const [product_factor_nodes, setProductFactorNodes] = useState<any[]>([]);
  const [measure_nodes, setMeasureNodes] = useState<any[]>([]);
  const [diagnostic_nodes, setDiagnosticNodes] = useState<any[]>([]);

  const [active_tqi_node, setActiveTQINode] = useState<any>(null);
  const [active_quality_aspect_node, setActiveQualityAspectNode] = useState<any>(null);
  const [active_product_factor_node, setActiveProductFactorNode] = useState<any>(null);
  const [active_measure_node, setActiveMeasureNode] = useState<any>(null);

  const [tqi_edges, setTQIEdges] = useState<any[]>([]);
  const [qa_edges, setQAEdges] = useState<any[]>([]);
  const [pf_edges, setPFEdges] = useState<any[]>([]);
  const [measure_edges, setMeasureEdges] = useState<any[]>([]);
  const [node_clicked_marker, setNodeClickedMarker] = useState<MouseEvent>();

  // called when a button is pressed.
  // used to ensure the button clicks update with the newest information
  useEffect(() => {

    // for not crashing upon first load
    if (node_clicked_marker == null)
      return;

    const newNodeId = node_clicked_marker.target.id;

    const clickedTQI = tqi_nodes.find((_node) => _node.name === newNodeId);
    const clickedQA = quality_aspect_nodes.find((_node) => _node.name === newNodeId);
    const clickedPF = product_factor_nodes.find((_node) => _node.name === newNodeId);
    const clickedMeasure = measure_nodes.find((_node) => _node.name === newNodeId);
    
    if (clickedTQI) {
      // case: it is not active, so the active node must be switched to it
      if (!active_tqi_node || clickedTQI.name !== active_tqi_node.name) { 
        setActiveTQINode(clickedTQI);
      }
      else {       // case: it is already active so it should be deactivated
        setActiveTQINode(null);
      }
    }
    
    else if (clickedQA) {
      // case: it is not active, so the active node must be switched to it
      if (!active_quality_aspect_node || clickedQA.name !== active_quality_aspect_node.name) { 
        setActiveQualityAspectNode(clickedQA);
      }
      else {       // case: it is already active so it should be deactivated
        setActiveQualityAspectNode(null);
      }
    }

    else if (clickedPF) { // only has one active node
      // case: it is not active, so the active node must be switched to it
      if (!active_product_factor_node || clickedPF.name !== active_product_factor_node.name) { 
        setActiveProductFactorNode(clickedPF);
      }
      else {       // case: it is already active so it should be deactivated
        setActiveProductFactorNode(null);
      }
    }

    else if (clickedMeasure) { // only has one active node
      // case: it is not active, so the active node must be switched to it
      if (!active_measure_node || clickedMeasure.name !== active_measure_node.name) { 
        setActiveMeasureNode(clickedMeasure);
      }
      else {       // case: it is already active so it should be deactivated
        setActiveMeasureNode(null);
      }
    }

  }, [node_clicked_marker]); // Empty dependency array ensures it runs only once after component mount

  // called when a product factor node is pressed to display the appropriate measure nodes in the correct location
  useEffect(() => {

    setMeasureNodes([]);
    setActiveMeasureNode(null);

    if (!active_product_factor_node) { // don't try to operate if there isn't an active node
      return;
    }

    let new_measures : any[] = []; // stores the measure nodes the PF node has weights for

    for (let name in _processedData.fileData.measures){
      if (active_product_factor_node.json_data.weights[name] !== undefined){
        new_measures.push(_processedData.fileData.measures[name]);
      }
    }

    setMeasureNodes(create_nodes(new_measures, active_product_factor_node._x + 75, 650));

  }, [active_product_factor_node]);

   // called when a measure node is pressed to display the appropriate diagnsotic nodes in the correct location
   useEffect(() => {

    setDiagnosticNodes([]);

    if (!active_measure_node) { // don't try to operate if there isn't an active node
      return;
    }

    let new_diagnostics : any[] = []; // stores the measure nodes the PF node has weights for

    for (let name in _processedData.fileData.diagnostics){
      if (active_measure_node.json_data.weights[name] !== undefined){
        new_diagnostics.push(_processedData.fileData.diagnostics[name]);
      }
    }

    setDiagnosticNodes(create_nodes(new_diagnostics, active_measure_node._x + 75, 800));

  }, [active_measure_node]);
  
  // calls the above use effect when a button is pressed.
  function node_clicked(e : MouseEvent){

    setNodeClickedMarker(e);
  }

  // used to display the updated node lists
  useEffect(() => {

    function set_nodes() {

      // top row of nodes -- function similar to root nodes (only 1 with doctored data file)
      setTQINodes(create_nodes(_processedData.fileData.factors.tqi, width / 2, 100)); // holds the data of each node

      // second row of nodes -- the children of the tqi nodes
      setQualityAspectNodes(create_nodes(_processedData.fileData.factors.quality_aspects, width / 2, 250));

      // third row of nodes -- the children of the quality aspect nodes
      setProductFactorNodes(create_nodes(_processedData.fileData.factors.product_factors, width / 2, 500));
    }

    set_nodes();
  }, []);
  
  // used to draw the edges of active nodes.
  useEffect(() => {

    function draw_active_edges() {
      setTQIEdges(draw_edges(active_tqi_node, quality_aspect_nodes));
      setQAEdges(draw_edges(active_quality_aspect_node, product_factor_nodes));
      setPFEdges(draw_edges(active_product_factor_node, measure_nodes));
      setMeasureEdges(draw_edges(active_measure_node, diagnostic_nodes));
    }

    draw_active_edges();
  }, [active_tqi_node, active_quality_aspect_node, 
      measure_nodes, diagnostic_nodes
  ]);

  // draw links between tqi node
  //let tqi_edges : any[] = draw_edges(active_tqi_nodes, active_quality_aspect_nodes);
  // using the active will only draw the edges of the clicked parent nodes
  //let qar_edges : any[] = draw_edges(active_quality_aspect_nodes, active_product_factor_nodes); 

  // notes:
  // rx is the curvature of the rect

  return width < min_width ? null : (
    
      <svg width={width} height={height} >
        <rect width={width} height={height} rx={10} id='tree_canvas' overflow-x={'auto'}/>

        {tqi_nodes.map((node : any) => {return node._rect;}) }
        {quality_aspect_nodes.map((node : any) => {return node._rect;}) }
        {product_factor_nodes.map((node : any) => {return node._rect;}) }
        {measure_nodes.map((node : any) => {return node._rect;}) }
        {diagnostic_nodes.map((node : any) => {return node._rect;}) }
        {tqi_edges}
        {qa_edges}
        {pf_edges}
        {measure_edges}

      </svg>

  );

  // creates and returns an array of nodes representing the specified layer
  function create_nodes(_factors : any, _x_pos: number, _y_pos: number){

    // ** REQUIRED TO PROCESS DATA ** //
    // TODO: will need to refactor so it doesn't break without
    _factors = process_data(_factors, 10.0);

    return _factors.map((_factor : any, index : number) => {

      // fixed distance
      const M = _x_pos;
      const C = _factors.length / 2;
      const x = (M - C * 150) + (index * 150);
      const y = _y_pos - node_height / 2;

      // Determine node color
      let node_id = 'low_node';
      if (_factors[index].value < 0.2){
        node_id = 'severe_node';
      }
      else if (_factors[index].value < 0.4){
        node_id = 'high_node';
      }
      else if (_factors[index].value < 0.6){
        node_id = 'elevated_node';
      }
      else if (_factors[index].value < 0.8){
        node_id = 'guarded_node';
      }



      return new TreeNode(
        _factors[index],
        (<Draggable key={_factors[index].name} disabled={true}
        onMouseDown={node_clicked}
        >
            <g>
              <rect height={node_height} width={node_width} x={x} y={y} className={node_id} id={_factors[index].name}/>
              <text x={x + node_width / 2} y={y + node_height / 4} className={'node_text'}>
                {_factors[index].name}
              </text>
              <text x={x + node_width / 2} y={y + node_height / 2} className={'node_text'}>
                {_factors[index].value.toFixed(2)}
              </text>
            </g>
          </Draggable>),
        node_width,
        node_height,
        x,
        y
      )
    });
  }

} // end of export

