// imports and code copied from https://airbnb.io/visx/trees for testing

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';
import { Group } from '@visx/group';
import { Tree, hierarchy } from '@visx/hierarchy';
import { HierarchyPointNode } from '@visx/hierarchy/lib/types';
import { LinkHorizontal } from '@visx/shape';
import { LinkVertical } from '@visx/shape';
import { LinearGradient } from '@visx/gradient';

// project imports
import TreeNode from "./TreeNode/TreeNode.jsx";
import { Color, tree } from 'd3';
import { Rect } from 'reactflow';
import './TreeDisplay.css';
import { CornerTopRightIcon } from '@radix-ui/react-icons';


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
let height = 500; // height of the background

let tqi_rects : any = [];
let quality_aspect_rects : any = [];
let product_factor_rects : any = [];
let active_tqi_rects : any = [];
let active_quality_aspect_rects : any = [];
let active_product_factor_rects : any = [];

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
  let tqi_nodes : any[] = create_nodes(_processedData.fileData.factors.tqi); // holds the data of each node
  tqi_rects = create_rects(tqi_nodes, height / 5); // holds the actual rect objects do be drawn in the svg

  // second row of nodes -- the children of the tqi nodes
  let quality_aspect_nodes : any[] = create_nodes(_processedData.fileData.factors.quality_aspects);
  quality_aspect_rects = create_rects(quality_aspect_nodes, (height / 5) * 2.5);

  // third row of nodes -- the children of the quality aspect nodes
  let product_factor_nodes : any[] = create_nodes(_processedData.fileData.factors.product_factors);
  product_factor_rects = create_rects(product_factor_nodes, (height / 5) * 4);

  // draw links between tqi node
  let tqi_links : any[] = draw_edges(tqi_rects, tqi_nodes, quality_aspect_rects);
  // using the active will only draw the edges of the clicked parent nodes
  let qar_links : any[] = draw_edges(quality_aspect_rects, quality_aspect_nodes, product_factor_rects); 

  // notes:
  // rx is the curvature of the rect

  const treeRef = useRef(null);

  useEffect(() => {
    if (treeRef.current) {


      //treeRef.current.scrollLeft = 5000; // doesn't actually set it and I'm not sure why
      //console.log(treeRef)

      // Ensure that treeRef.current is not null or undefined
      
      //console.log(treeRef.current.scrollLeft);
    }
  }, []);

  return width < min_width ? null : (
    
      <svg width={width} height={height} >
        <rect width={width} height={height} rx={10} id='tree_canvas' overflow={'auto'} ref={treeRef}/>

        {tqi_rects}
        {quality_aspect_rects}
        {product_factor_rects}
        {tqi_links}
        {qar_links}

      </svg>

  );
} // end of export

// test function for sorting through nodes
function process_data(_data : any[], _filter : number){

  let clensed = [];

  for (let _dataPoint in _data) {
    if (_data[_dataPoint].value != _filter){
      clensed.push(_data[_dataPoint]);
    }
  }

  return clensed;
}

// creates and returns an array of nodes representing the specified layer
function create_nodes(_factors : any){

  let nodes : any = [];

  const node_x = width / 2 - node_width / 2;
  const node_y = 15;

  _factors = process_data(_factors, 0.0);

  for (let _factor in _factors) {
    nodes.push(
      new TreeNode( // not sure why it's not recognizing the constructor, but its working so whatever
        _factors[_factor],
        node_width,
        node_height,
        node_x,
        node_y
      )
    );
  }

  return nodes;
}

// draws the nodes on top of the svg
// ignores the stored values of x and y pos and calculates its own
// the _y_pos paramter is required so this can be reused for different node types
function create_rects(nodes : any[], _y_pos : number){

  // Return an array of draggable nodes
  return nodes.map((node, index) => {

    // percentage distance
    //let x = (index + 1) * (width / (nodes.length + 1)) - node_width / 2;
    //let y = _y_pos - node_height / 2;

    // fixed distance
    const M = width / 2;
    const C = nodes.length / 2;
    const x = (M - C * 150) + (index * 150);
    const y = _y_pos - node_height / 2;

    // Determine node color
    let node_id = 'low_node';
    if (node.json_data.value < 0.2){
      node_id = 'severe_node';
    }
    else if (node.json_data.value < 0.4){
      node_id = 'high_node';
    }
    else if (node.json_data.value < 0.6){
      node_id = 'elevated_node';
    }
    else if (node.json_data.value < 0.8){
      node_id = 'guarded_node';
    }

    // Return a Draggable component containing the node
    return (
      <Draggable key={node.name} disabled={false} 
      onMouseDown={(e) => {node_clicked(e)}} 
      >
        <g>
          <rect height={node_height} width={node_width} x={x} y={y} className={'node_rect'} id={node_id}/>
          <text x={x + node_width / 2} y={y + node_height / 4} className={'node_text'}>
            {node.name}
          </text>
          <text x={x + node_width / 2} y={y + node_height / 2} className={'node_text'}>
            {node.json_data.value.toFixed(2)}
          </text>
        </g>
      </Draggable>
    );
  });
}

// called when a node is clicked
function node_clicked(e : MouseEvent){

  // ** attemp 4 at draggable nodes



  // ** only displaying active parent's edges

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


}

// draws the links from the node to the children nodes
// docs: https://d3js.org/d3-path
//       https://observablehq.com/@d3/d3-path
//       https://www.w3.org/TR/SVG/paths.html#PathDataLinetoCommands
function draw_edges(parents : any[], nodes: any[], children : any[]){

  //parents.forEach(function(_parent){
    return parents.map((_parent, p_index) => {


    // get parents x and y coords
    let parent_x = _parent.props.children.props.children[0].props.x + _parent.props.children.props.children[0].props.width / 2;
    let parent_y = _parent.props.children.props.children[0].props.y + _parent.props.children.props.children[0].props.height;

    //children.forEach(function(_child){
    return children.map((_child, c_index) => {

      // get childrens x and y coord
      let child_x = _child.props.children.props.children[0].props.x + _child.props.children.props.children[0].props.width / 2;
      let child_y = _child.props.children.props.children[0].props.y;

      // calc control points
      let x1 = parent_x;
      let y1 = (parent_y + child_y) / 2;

      let x2 = child_x;
      let y2 = y1;
      
      // draws bezier curve
      // the id for each edge is the parent node name concatenated with the child node name without a space
      // note: i need a messy conditional here because the 'side' attribute of the <textPath> is not supported in 
      //      any browsers besides firefox; so my rememdy is to reverse the start and endpoints of the path manually
      if (child_x > parent_x){
        return(
          <g>
            <path key={_parent.key + _child.key} id={_parent.key + _child.key} d={`M${parent_x} ${parent_y} C${x1} ${y1} ${x2} ${y2} ${child_x} ${child_y}`} 
            stroke={'#000000'} strokeWidth={1} fill={'none'}/>
            <text>
              <textPath 
              href={`#${_parent.key + _child.key}`}
              startOffset={'50%'}
              className={'edge_text'}>
                {nodes[p_index].json_data.weights[_child.key].toFixed(2)}
              </textPath>
            </text>
          </g>
        ); // end return
      } // end if
      else{
        return(
          <g>
            <path key={_parent.key + _child.key} id={_parent.key + _child.key} d={`M${child_x} ${child_y} C${x2} ${y2} ${x1} ${y1} ${parent_x} ${parent_y}`} 
            stroke={'#000000'} strokeWidth={1} fill={'none'}/>
            <text>
              <textPath 
              href={`#${_parent.key + _child.key}`}
              startOffset={'50%'}
              className={'edge_text'}>
                {nodes[p_index].json_data.weights[_child.key].toFixed(2)}
              </textPath>
            </text>
          </g>
        ); // end return
      } // end else
    }); // end child map
  }); // end parent map
} // end func