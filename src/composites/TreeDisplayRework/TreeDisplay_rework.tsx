// imports and code copied from https://airbnb.io/visx/trees for testing

import React, { useMemo } from 'react';
import { Group } from '@visx/group';
import { Tree, hierarchy } from '@visx/hierarchy';
import { HierarchyPointNode } from '@visx/hierarchy/lib/types';
import { LinkHorizontal } from '@visx/shape';
import { LinkVertical } from '@visx/shape';
import { LinearGradient } from '@visx/gradient';

// project imports
import TreeNode from "./TreeNode/TreeNode.jsx";
import { Color } from 'd3';
import { Rect } from 'reactflow';
import './TreeDisplay.css';

const node_width = 120;
const node_height = 60;

const min_width = 400; // the min width at which to render the tree
let width = 900; // width of the background
let height = 500; // height of the background

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
  const tqi_nodes : any[] = create_nodes(_processedData.fileData.factors.tqi); // holds the data of each node
  const tqi_rects : any[] = create_rects(tqi_nodes, 100); // holds the actual rect objects do be drawn in the svg

  // second row of nodes -- the children of the tqi nodes
  const quality_aspect_nodes : any[] = create_nodes(_processedData.fileData.factors.quality_aspects);
  const quality_aspect_rects : any[] = create_rects(quality_aspect_nodes, 250);

  // third row of nodes -- the children of the quality aspect nodes
  const product_factor_nodes : any[] = create_nodes(_processedData.fileData.factors.product_factors);
  const product_factor_rects : any[] = create_rects(product_factor_nodes, 400);

  // draw links between tqi node
  const tqi_links : any[] = draw_links(tqi_rects, quality_aspect_rects);
  const qar_links : any[] = draw_links(quality_aspect_rects, product_factor_rects);

  // notes:
  // rx is the curvature of the rect

  return width < min_width ? null : (

    // I need a way to dynamically write the html to draw the nodes
    <svg width={width} height={height}>
      <rect width={width} height={height} rx={10} id='tree_canvas'/>


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

  _factors = process_data(_factors, 1.0);

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

  let rects : any[] = []; // empty array to return
  nodes.forEach(function(node, index) {
    let x = (index + 1) * (width / (nodes.length + 1)) - node_width / 2;
    let y = _y_pos - node_height / 2;
    
    // determine color of the node
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

    rects.push(
      <g key={node.name}>
        <rect height={node_height} width={node_width} x={x} y={y} className={'node_rect'} id={node_id}/>
        <text x={x + node_width / 2} y={y + node_height / 4} className={'node_text'}>
          {node.name}
        </text>
        <text x={x + node_width / 2} y={y + node_height / 2} className={'node_text'}>
          {node.json_data.value.toFixed(2)}
        </text>
      </g>
    );
  });

  return rects;
}

// draws the links from the node to the children nodes
function draw_links(parents : any[], children : any[]){

  let links : any[] = []; // storage for all the lines

  parents.forEach(function(_parent){

    // get parents x and y coords
    let parent_x = _parent.props.children[0].props.x + _parent.props.children[0].props.width / 2;
    let parent_y = _parent.props.children[0].props.y + _parent.props.children[0].props.height;

    children.forEach(function(_child){

      // get childrens x and y coord
      let child_x = _child.props.children[0].props.x + _child.props.children[0].props.width / 2;
      let child_y = _child.props.children[0].props.y;

      links.push(
        <path d={`M${parent_x} ${parent_y} L${child_x} ${child_y}`} 
        stroke={'#000000'} strokeWidth={5} fill={'none'}/>
      );

    });
  });

  return links
}