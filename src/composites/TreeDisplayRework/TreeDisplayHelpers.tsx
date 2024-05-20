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

// test function for sorting through nodes
export function process_data(_data : any[], _filter : number){

  let clensed = [];

  for (let _dataPoint in _data) {
    if (_data[_dataPoint].value != _filter){
      clensed.push(_data[_dataPoint]);
    }
  }

  return clensed;
}

// draws the links from the node to the children nodes
// docs: https://d3js.org/d3-path
//       https://observablehq.com/@d3/d3-path
//       https://www.w3.org/TR/SVG/paths.html#PathDataLinetoCommands
export function draw_edges(_parent : any, _children : any[]){

  if (!_parent || !_children)
    return;
      
  // get parents x and y coords
  let parent_x = _parent._rect.props.children.props.children[0].props.x + _parent._rect.props.children.props.children[0].props.width / 2;
  let parent_y = _parent._rect.props.children.props.children[0].props.y + _parent._rect.props.children.props.children[0].props.height;
  
  //children.forEach(function(_child){
  return _children.map((_child : any) => {
  
    // get childrens x and y coord
    let child_x = _child._rect.props.children.props.children[0].props.x + _child._rect.props.children.props.children[0].props.width / 2;
    let child_y = _child._rect.props.children.props.children[0].props.y;
  
    // calc control points
    let x1 = parent_x;
    let y1 = (parent_y + child_y) / 2;
  
    let x2 = child_x;
    let y2 = y1;
    // draws bezier curve
    // the id for each edge is the parent node name concatenated with the child node name without a space
    // note: i need a messy conditional here because the 'side' attribute of the <textPath> is not supported in 
    //      any browsers besides firefox; so my rememdy is to reverse the start and endpoints of the path manually
    if (_parent.json_data.weights[_child._rect.key]){
      return(
        <g>
          <path key={_parent._rect.key + _child.key} id={_parent._rect.key + _child._rect.key} 
          d={child_x > parent_x ? `M${parent_x} ${parent_y} C${x1} ${y1} ${x2} ${y2} ${child_x} ${child_y}`
            : `M${child_x} ${child_y} C${x2} ${y2} ${x1} ${y1} ${parent_x} ${parent_y}`} 
          stroke={'#000000'} strokeWidth={1} fill={'none'}/>
          <text>
            <textPath 
            href={`#${_parent._rect.key + _child._rect.key}`}
            startOffset={'50%'}
            className={'edge_text'}>
              {_parent.json_data.weights[_child._rect.key].toFixed(2)}
            </textPath>
          </text>
        </g>
      ); // end return
    } // end if
  }); // end child map
} // end func

export function draw_up_edges(_parent : any, _children : any[]){


  if (!_parent || !_children)
    return;
      
  // get parents x and y coords
  let parent_x = _parent._rect.props.children.props.children[0].props.x + _parent._rect.props.children.props.children[0].props.width / 2;
  let parent_y = _parent._rect.props.children.props.children[0].props.y;
  
  //children.forEach(function(_child){
  return _children.map((_child : any) => {
  
    // get childrens x and y coord
    let child_x = _child._rect.props.children.props.children[0].props.x + _child._rect.props.children.props.children[0].props.width / 2;
    let child_y = _child._rect.props.children.props.children[0].props.y + _child._rect.props.children.props.children[0].props.height;
  
    // calc control points
    let x1 = parent_x;
    let y1 = (parent_y + child_y) / 2;
  
    let x2 = child_x;
    let y2 = y1;
    // draws bezier curve
    // the id for each edge is the parent node name concatenated with the child node name without a space
    // note: i need a messy conditional here because the 'side' attribute of the <textPath> is not supported in 
    //      any browsers besides firefox; so my rememdy is to reverse the start and endpoints of the path manually
    if (_child.json_data.weights[_parent._rect.key]){
      return(
        <g>
          <path key={_parent._rect.key + _child.key} id={_parent._rect.key + _child._rect.key} 
          d={child_x > parent_x ? `M${parent_x} ${parent_y} C${x1} ${y1} ${x2} ${y2} ${child_x} ${child_y}`
            : `M${child_x} ${child_y} C${x2} ${y2} ${x1} ${y1} ${parent_x} ${parent_y}`} 
          stroke={'#000000'} strokeWidth={1} fill={'none'}/>
          <text>
            <textPath 
            href={`#${_parent._rect.key + _child._rect.key}`}
            startOffset={'50%'}
            className={'edge_text'}>
              {_child.json_data.weights[_parent._rect.key].toFixed(2)}
            </textPath>
          </text>
        </g>
      ); // end return
    } // end if
  }); // end child map
}