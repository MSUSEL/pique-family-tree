// project imports
import TreeNode from "./TreeNode/TreeNode.jsx";
import './TreeDisplay.css';
import { CornerTopRightIcon } from '@radix-ui/react-icons';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';
import {process_data, draw_edges} from './TreeDisplayHelpers.tsx'


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

const node_width = 120;
const node_height = 60;

const min_width = 400; // the min width at which to render the tree
let width = 10000; // width of the background
let height = 600; // height of the background

let active_tqi_nodes : any = [];
let active_quality_aspect_nodes : any = [];
let active_product_factor_nodes : any = [];

let tqi_nodes : any[] = [];
let quality_aspect_nodes : any[] = [];
let product_factor_nodes : any[] = [];

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

  // top row of nodes -- function similar to root nodes (only 1 with doctored data file)
  tqi_nodes = create_nodes(_processedData.fileData.factors.tqi, 100); // holds the data of each node
  active_tqi_nodes = tqi_nodes;

  // second row of nodes -- the children of the tqi nodes
  quality_aspect_nodes = create_nodes(_processedData.fileData.factors.quality_aspects, 250);
  active_quality_aspect_nodes = quality_aspect_nodes;

  // third row of nodes -- the children of the quality aspect nodes
  product_factor_nodes = create_nodes(_processedData.fileData.factors.product_factors, 400);
  active_product_factor_nodes = product_factor_nodes;

  // draw links between tqi node
  let tqi_edges : any[] = draw_edges(active_tqi_nodes, active_quality_aspect_nodes);
  // using the active will only draw the edges of the clicked parent nodes
  let qar_edges : any[] = draw_edges(active_quality_aspect_nodes, active_product_factor_nodes); 

  // notes:
  // rx is the curvature of the rect

  const treeRef = useRef(null);

  useEffect(() => {
    if (treeRef.current) {


      treeRef.current.scrollLeft = 5000; // doesn't actually set it and I'm not sure why
      console.log(treeRef)

      // Ensure that treeRef.current is not null or undefined
      
      console.log(treeRef.current.scrollLeft);
    }
  }, []);

  return width < min_width ? null : (
    
      <svg width={width} height={height} >
        <rect width={width} height={height} rx={10} id='tree_canvas' overflow-x={'auto'} ref={treeRef}/>

        { active_tqi_nodes.map((node : any) => {return node._rect;}) }
        { active_quality_aspect_nodes.map((node) => {return node._rect;}) }
        { active_product_factor_nodes.map((node) => {return node._rect;}) }
        {tqi_edges}
        {qar_edges}

      </svg>

  );
} // end of export

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
      (<Draggable key={_factors[index].name} disabled={false} 
        onMouseDown={(e) => {node_clicked(e)}} 
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


// called when a node is clicked
function node_clicked(e : MouseEvent){

  // ** attempt 4 at draggable nodes

  //console.log(document.getElementById(e.target.id));
  console.log(e.target);

  // updates aren't dynamic
  console.log(tqi_nodes[0]._x);
  tqi_nodes[0]._x += 10;
  //active_quality_aspect_nodes.length = 0;
  active_quality_aspect_nodes = [];

  // ** only displaying active parent's edges


  /*
  // check to see if it is a tqi node
  tqi_rects.forEach((_rect : any) => {

    if (_rect.key === e.target.id){
      
      if (active_tqi_rects.includes(e.target)){
        const index = active_tqi_rects.indexOf(e.target);
        active_tqi_rects.splice(index, 1);
      }
      else{
        active_tqi_rects.push(e.target);
      }

      return; // don't check other nodes
    }
  });

  // check to see if it is a quality aspect node
  quality_aspect_rects.forEach((_rect : any) => {

    if (_rect.key === e.target.id){
      
      if (active_quality_aspect_rects.includes(e.target)){        
        const index = active_quality_aspect_rects.indexOf(e.target);
        active_quality_aspect_rects.splice(index, 1);
      }
      else{
        active_quality_aspect_rects.push(e.target);
      }

      return; // don't check other nodes
    }
  });

  // check to see if it is a product factor node
  product_factor_rects.forEach((_rect : any) => {

    if (_rect.key === e.target.id){
      
      if (active_product_factor_rects.includes(e.target)){        
        const index = active_product_factor_rects.indexOf(e.target);
        active_product_factor_rects.splice(index, 1);
      }
      else{
        active_product_factor_rects.push(e.target);
      }

      return; // don't check other nodes
    }
  });

  */
}