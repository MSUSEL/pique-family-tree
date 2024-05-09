// project imports
import TreeNode from "./TreeNode/TreeNode.jsx";
import './TreeDisplay.css';
import { CornerTopRightIcon } from '@radix-ui/react-icons';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';
import {process_data, draw_edges} from './TreeDisplayHelpers.tsx'
import { boolean } from "zod";
import { update } from "ramda";


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

  const [active_tqi_nodes, setActiveTQINodes] = useState<any[]>([]);
  const [active_quality_aspect_nodes, setActiveQualityAspectNodes] = useState<any[]>([]);
  const [active_product_factor_nodes, setActiveProductFactorNodes] = useState<any[]>([]);
  const [active_measure_nodes, setActiveMeasureNodes] = useState<any[]>([]);
  const [active_diagnostic_nodes, setActiveDiagnosticNodes] = useState<any[]>([]);

  const [tqi_edges, setTQIEdges] = useState<any[]>([]);
  const [qa_edges, setQAEdges] = useState<any[]>([]);
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
    const clickedDiagnsotic = diagnostic_nodes.find((_node) => _node.name === newNodeId);


    // testing
    setActiveMeasureNodes(measure_nodes);
    setActiveMeasureNodes(diagnostic_nodes);
    
    if (clickedTQI) {
 
      // Create a new array for updated active nodes
      let updatedActiveNodes : any[] = [...active_tqi_nodes];
    
      if (updatedActiveNodes.find((_node) => _node.name === newNodeId)) {
        const index = updatedActiveNodes.indexOf(updatedActiveNodes.find((_node) => _node.name === newNodeId));
        updatedActiveNodes.splice(index, 1);
      }
      else{
        updatedActiveNodes = [...updatedActiveNodes, clickedTQI];
      }

      setActiveTQINodes(updatedActiveNodes);
    }
    
    if (clickedQA) {
      // Create a new array for updated active nodes
      let updatedActiveNodes : any[] = [...active_quality_aspect_nodes];
    
      if (updatedActiveNodes.find((_node) => _node.name === newNodeId)) {
        const index = updatedActiveNodes.indexOf(updatedActiveNodes.find((_node) => _node.name === newNodeId));
        updatedActiveNodes.splice(index, 1);
      }
      else{
        updatedActiveNodes = [...updatedActiveNodes, clickedQA];
      }

      setActiveQualityAspectNodes(updatedActiveNodes);
    }

    if (clickedPF) {
      // Create a new array for updated active nodes
      let updatedActiveNodes : any[] = [...active_product_factor_nodes];
    
      if (updatedActiveNodes.find((_node) => _node.name === newNodeId)) {
        const index = updatedActiveNodes.indexOf(updatedActiveNodes.find((_node) => _node.name === newNodeId));
        updatedActiveNodes.splice(index, 1);
      }
      else{
        updatedActiveNodes = [...updatedActiveNodes, clickedPF];
      }

      setActiveProductFactorNodes(updatedActiveNodes);
    }

  }, [node_clicked_marker]); // Empty dependency array ensures it runs only once after component mount

  // calls the above use effect when a button is pressed.
  function node_clicked(e : MouseEvent){

    setNodeClickedMarker(e);
  }

  // used to display the updated node lists
  useEffect(() => {

    function set_nodes() {

      // top row of nodes -- function similar to root nodes (only 1 with doctored data file)
      setTQINodes(create_nodes(_processedData.fileData.factors.tqi, 100)); // holds the data of each node
      //setActiveTQINodes(tqi_nodes);

      // second row of nodes -- the children of the tqi nodes
      setQualityAspectNodes(create_nodes(_processedData.fileData.factors.quality_aspects, 250));
      //setActiveQualityAspectNodes(quality_aspect_nodes);
      //active_quality_aspect_nodes.map((node : any) => {node._rect.addEventListener(MouseEvent, node_clicked)});

      // third row of nodes -- the children of the quality aspect nodes
      setProductFactorNodes(create_nodes(_processedData.fileData.factors.product_factors, 500));
      //setActiveProductFactorNodes(product_factor_nodes);
      //active_product_factor_nodes.map((node : any) => {node._rect.addEventListener(MouseEvent, node_clicked)});

      // fourth row of children -- hidden by default until a QA node is clicked
      setMeasureNodes(create_nodes(_processedData.fileData.measures, 650));

      // fourth row of children -- hidden by default until a measure node is clicked
      setDiagnosticNodes(create_nodes(_processedData.fileData.diagnostics, 800));
    }

    set_nodes();
  }, []);
  
  // used to draw the edges of active nodes.
  useEffect(() => { // for some reason this doens't render when the active arrays are

    function draw_active_edges() {
      setTQIEdges(draw_edges(active_tqi_nodes, quality_aspect_nodes));
      setQAEdges(draw_edges(active_quality_aspect_nodes, product_factor_nodes));
    }

    draw_active_edges();
  }, [active_tqi_nodes, active_quality_aspect_nodes, active_product_factor_nodes,
      active_measure_nodes, active_diagnostic_nodes
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

      </svg>

  );

  // creates and returns an array of nodes representing the specified layer
  function create_nodes(_factors : any, _y_pos: number){

    _factors = process_data(_factors, 0.0);

    return _factors.map((_factor : any, index : number) => {


      // fixed distance
      const M = width / 2;
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

