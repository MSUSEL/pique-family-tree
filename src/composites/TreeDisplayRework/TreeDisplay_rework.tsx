// project imports
import TreeNode from "./TreeNode/TreeNode.jsx";
import './TreeDisplay.css';
import { CornerTopRightIcon } from '@radix-ui/react-icons';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';
import {process_data, draw_edges} from './TreeDisplayHelpers.tsx'
import { boolean } from "zod";


// TODO:
//    - drag nodes                                              ** I need a way to grab the updated x and y coords of the <draggable>
//    - drag page around
//    - measures nodes
//    - diagnostics nodes
//    - link to color helper .js
//    - differentiate between types of nodes
//    - edge weights                                            ** done ** 
//    - edit edge weights
//    - edit node values
//    - add up arrow and close eye icon to nodes
//    - horizontal and vertical scroll bars to tree canvas      ** need to center horizontal bar upon loading ** 
//    - reset zoom button
//    - reset selection button
//    - quick actions button


//    - d3/visx panning/scrolling/zooming
//    - react gesture for dragging
//    - usestate/usememo/usecallback/useeffect

const node_width = 120;
const node_height = 60;

const min_width = 400; // the min width at which to render the tree
let width = 10000; // width of the background
let height = 600; // height of the background

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
  const [active_tqi_nodes, setActiveTQINodes] = useState<any[]>([]);
  const [active_quality_aspect_nodes, setActiveQualityAspectNodes] = useState<any[]>([]);
  const [active_product_factor_nodes, setActiveProductFactorNodes] = useState<any[]>([]);
  const [tqi_edges, setTQIEdges] = useState<any[]>([]);
  const [qa_edges, setQAEdges] = useState<any[]>([]);

  function node_clicked(e : MouseEvent){

    const newNodeId = e.target.id;

    // Check if node clicked is a tqi node
    const clickedTQI = tqi_nodes.find((_node) => _node.name === newNodeId);
    // Check if node clicked is a qa node
    const clickedQA = quality_aspect_nodes.find((_node) => _node.name === newNodeId);
    // Check if node clicked is a pf node
    const clickedPF = product_factor_nodes.find((_node) => _node.name === newNodeId);
    
    if (clickedTQI) {
      console.log('clicked tqi');
      // Create a new array for updated active nodes
      const updatedActiveNodes = active_tqi_nodes.includes(clickedTQI)
        ? active_tqi_nodes.filter((activeNode) => activeNode !== clickedTQI) // Remove node if already active
        : [...active_tqi_nodes, clickedTQI]; // Add node if not active
    

      setActiveTQINodes(updatedActiveNodes);
    }
    
    if (clickedQA) {
      console.log('clicked qa');

      // Create a new array for updated active nodes
      const updatedActiveNodes = active_quality_aspect_nodes.includes(clickedQA)
        ? active_quality_aspect_nodes.filter((activeNode) => activeNode !== clickedQA) // Remove node if already active
        : [...active_quality_aspect_nodes, clickedQA]; // Add node if not active
    
      console.log(updatedActiveNodes);
      setActiveQualityAspectNodes(updatedActiveNodes);
    }

    if (clickedPF) {
      console.log('clicked pf');

      // Create a new array for updated active nodes
      const updatedActiveNodes = active_product_factor_nodes.includes(clickedPF)
        ? active_product_factor_nodes.filter((activeNode) => activeNode !== clickedPF) // Remove node if already active
        : [...active_product_factor_nodes, clickedPF]; // Add node if not active
    
      setActiveProductFactorNodes(updatedActiveNodes);
    }
    

    /*

    // check if node clicked was a pf node
    quality_aspect_nodes.map((_node) => {

      let marker : boolean = false;;

      if (_node.name === e.target.id){ // we found the node clicked

        new_active_nodes = active_quality_aspect_nodes;

        console.log('is pf node');
        
        active_quality_aspect_nodes.map((active_node) => { // check if it is currently active

          if (active_node.name === e.target.id){ // remove item from active array
            console.log('is active');
            const index = active_quality_aspect_nodes.indexOf(active_node);
            new_active_nodes.splice(index, 1);
            setActiveQualityAspectNodes(new_active_nodes);
            marker = true;
            return;
          }
        });

        if (marker)
          return;

        // if we don't find anything, add the node to the active list
        new_active_nodes.push(_node);
        setActiveQualityAspectNodes(new_active_nodes);
        console.log('isnt active');

        return; // don't bother checking the other types of nodes
      }
    });

    // check if node clicked was a pf node
    product_factor_nodes.map((_node) => {

      let marker : boolean = false;;

      if (_node.name === e.target.id){ // we found the node clicked

        new_active_nodes = active_product_factor_nodes;

        console.log('is pf node');
        
        active_product_factor_nodes.map((active_node) => { // check if it is currently active

          if (active_node.name === e.target.id){ // remove item from active array
            console.log('is active');
            const index = active_product_factor_nodes.indexOf(active_node);
            new_active_nodes.splice(index, 1);
            setActiveProductFactorNodes(new_active_nodes);
            marker = true;
            return;
          }
        });

        if (marker)
          return;

        // if we don't find anything, add the node to the active list
        new_active_nodes.push(_node);
        setActiveProductFactorNodes(new_active_nodes);
        console.log('isnt active');

        return; // don't bother checking the other types of nodes
      }
    });*/
  }

  

  useEffect(() => {

    function set_nodes() {
      console.log('inside set nodes');
      // top row of nodes -- function similar to root nodes (only 1 with doctored data file)
      setTQINodes(create_nodes(_processedData.fileData.factors.tqi, 100)); // holds the data of each node
      //setActiveTQINodes(tqi_nodes);

      // second row of nodes -- the children of the tqi nodes
      setQualityAspectNodes(create_nodes(_processedData.fileData.factors.quality_aspects, 250));
      //setActiveQualityAspectNodes(quality_aspect_nodes);
      //active_quality_aspect_nodes.map((node : any) => {node._rect.addEventListener(MouseEvent, node_clicked)});

      // third row of nodes -- the children of the quality aspect nodes
      setProductFactorNodes(create_nodes(_processedData.fileData.factors.product_factors, 400));
      //setActiveProductFactorNodes(product_factor_nodes);
      //active_product_factor_nodes.map((node : any) => {node._rect.addEventListener(MouseEvent, node_clicked)});
    }

    set_nodes();
  }, []);
  
  useEffect(() => { // for some reason this doens't render on the intial load

    function draw_active_edges() {
      console.log('inside draw active edges');
      setTQIEdges(draw_edges(active_tqi_nodes, quality_aspect_nodes));
      setQAEdges(draw_edges(active_quality_aspect_nodes, product_factor_nodes));
    }

    draw_active_edges();
  }, [active_tqi_nodes, active_quality_aspect_nodes, active_product_factor_nodes]);

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

