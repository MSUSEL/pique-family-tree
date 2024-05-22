// project imports
import TreeNode from "./TreeNode/TreeNode.jsx";
import './TreeDisplay.css';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';
import {process_data, draw_edges, draw_up_edges} from './TreeDisplayHelpers.tsx'
import { EyeOpenIcon, EyeClosedIcon, ArrowUpIcon } from "@radix-ui/react-icons";
import NodeDescriptionPanel from "./nodeDescriptionPanel/NodeDescriptionPanel";
import { useProcessedData } from "../../data/useProcessedData";
import { useAtomValue } from "jotai";
import { State } from "../../state";
import * as d3 from 'd3';
import { render } from "react-dom";


// TODO:
//    - support node description panel                          ** FOCUS **
//    - drag nodes                                              ** I need a way to grab the updated x and y coords of the <draggable>
//    - drag page around
//    - measures nodes                                          ** done **
//    - diagnostics nodes                                       ** done **
//    - differentiate between types of nodes
//    - edge weights                                            ** done ** 
//    - edit edge weights
//    - edit node values
//    - add up arrow                                            ** done**
//    - dynamic close and open eye icon                         ** done ** 
//    - horizontal and vertical scroll bars to tree canvas      ** need to center horizontal bar upon loading ** 
//    - reset zoom functionality
//    - reset selection button
//    - quick actions button
//    - click on node to activate its edges to it's children    ** done **
//    - look at list display to see how it gets the updated data - it's not passed as a parameter   ** done **
//    - BUGFIX - processed data does not reset without reloading page and showing 0 weights is no longer working

//    - REWORK SCROLLBARS TO BE PANNING AND ZOOMING - REMOVE SCROLLBARS
//    - d3/visx panning/scrolling/zooming
//    - react gesture for dragging
//    - usestate/usememo/usecallback/useeffect

const node_width = 120;
const node_height = 60;

// the height on the canvas to render the various nodes
let node_y_spacing = 200;
const tqi_y = 70;
const quality_aspect_y = tqi_y + node_y_spacing;
const product_factor_y = quality_aspect_y + node_y_spacing;
const measure_y = product_factor_y + node_y_spacing;
const diagnostic_y = measure_y + node_y_spacing;

const min_width = 400; // the min width at which to render the tree
let canvas_width = 10000; // width of the background
let canvas_height = diagnostic_y + 70; // height of the background



//export default function Example({ width, height, margin = defaultMargin }: TreeProps) { // original
export function TreeDisplay_Rework() {

  const processedData = useProcessedData();

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
  const [upwards_product_factor_node, setUpwardsProductFactorNode] = useState<any>(null);
  const [active_measure_node, setActiveMeasureNode] = useState<any>(null);

  const [tqi_edges, setTQIEdges] = useState<any[]>([]);
  const [qa_edges, setQAEdges] = useState<any[]>([]);
  const [pf_edges, setPFEdges] = useState<any[]>([]);
  const [measure_edges, setMeasureEdges] = useState<any[]>([]);
  const [PF_up_edges, setPFUpEdges] = useState<any[]>([]);
  const [node_clicked_marker, setNodeClickedMarker] = useState<React.MouseEvent<SVGGElement, MouseEvent>>();
  const [arrow_clicked_marker, setArrowClickedMarker] = useState<React.MouseEvent<SVGGElement, MouseEvent>>();
  const [open_eye_clicked_marker, setOpenEyeClickedMarker] = useState<React.MouseEvent<SVGGElement, MouseEvent>>();
  const [closed_eye_clicked_marker, setClosedEyeClickedMarker] = useState<React.MouseEvent<SVGGElement, MouseEvent>>();

  const [nodesForPanelBoxes, setNodesForPanelBoxes] = useState([]);

  // called when a node is pressed.
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
  
  // calls the above use effect when a node is pressed.
  function node_clicked(e: React.MouseEvent<SVGGElement, MouseEvent>){
    setNodeClickedMarker(e);
  }

  // calls the arrow clicked use effect func.
  function arrow_clicked(e : any){
    setArrowClickedMarker(e);
  }

  // called when an up arrow is pressed on one of the PF nodes.
  useEffect(() => {

    if (!arrow_clicked_marker) // so it doesn't break on initial load
      return;

    // .substring(8) cleanes the 'uparrow ' part of id
    const clickedPF = product_factor_nodes.find((_node) => _node.name === arrow_clicked_marker.target.id.substring(8));

    if (upwards_product_factor_node && clickedPF.name === upwards_product_factor_node.json_data.name){
      setPFUpEdges([]); // erase the lines if the active node was pressed
      setUpwardsProductFactorNode(null);
      return;
    }

    setUpwardsProductFactorNode(clickedPF);
    setPFUpEdges(draw_up_edges(clickedPF, quality_aspect_nodes));
  }, [arrow_clicked_marker]);

  // calls the open eye use effect func.
  function closed_eye_clicked(e : any){
    setClosedEyeClickedMarker(e);
  }

  // called when an open eye icon is clicked
  useEffect(() => {

    if (!closed_eye_clicked_marker) // so it doesn't break on initial load
      return;

    // .substring cleans the 'openeye ' part of id
    const clicked_ID = closed_eye_clicked_marker.target.id.substring(10);

    const clickedTQI = tqi_nodes.find((_node) => _node.name === clicked_ID);
    const clickedQA = quality_aspect_nodes.find((_node) => _node.name === clicked_ID);
    const clickedPF = product_factor_nodes.find((_node) => _node.name === clicked_ID);
    const clickedMeasure = measure_nodes.find((_node) => _node.name === clicked_ID);
    const clickedDiagnostic = diagnostic_nodes.find((_node) => _node.name === clicked_ID);
    
    
    if (clickedTQI) {
      let new_tqi_nodes = [];
      new_tqi_nodes = tqi_nodes.map((_node) => {
        if (_node.json_data.name === clickedTQI.json_data.name){
          return redraw_node(_node, false, true);
        }
        else{
          return _node;
        }
      });
      setTQINodes(new_tqi_nodes);
    }
    else if (clickedQA){
      let new_qa_nodes = [];
      new_qa_nodes = quality_aspect_nodes.map((_node) => {
        if (_node.json_data.name === clickedQA.json_data.name){
          return redraw_node(_node, false, true);
        }
        else{
          return _node;
        }
      });
      setQualityAspectNodes(new_qa_nodes);
    }
    else if (clickedPF){
      let new_pf_nodes = [];
      new_pf_nodes = product_factor_nodes.map((_node) => {
        if (_node.json_data.name === clickedPF.json_data.name){
          return redraw_node(_node, true, true);
        }
        else{
          return _node;
        }
      });
      setProductFactorNodes(new_pf_nodes);
    }
    else if (clickedMeasure){
      let new_measure_nodes = [];
      new_measure_nodes = measure_nodes.map((_node) => {
        if (_node.json_data.name === clickedMeasure.json_data.name){
          return redraw_node(_node, false, true);
        }
        else{
          return _node;
        }
      });
      setMeasureNodes(new_measure_nodes);
    }
    else if (clickedDiagnostic){
      let new_diagnostic_nodes = [];
      new_diagnostic_nodes = diagnostic_nodes.map((_node) => {
        if (_node.json_data.name === clickedDiagnostic.json_data.name){
          return redraw_node(_node, false, true);
        }
        else{
          return _node;
        }
      });
      setDiagnosticNodes(new_diagnostic_nodes);
    }    
  }, [closed_eye_clicked_marker]);

  // calls the open eye use effect func.
  function open_eye_clicked(e : any){
    setOpenEyeClickedMarker(e);
  }

  // called when an open eye icon is clicked
  useEffect(() => {

    if (!open_eye_clicked_marker) // so it doesn't break on initial load
      return;

    // .substring cleans the 'openeye ' part of id
    const clicked_ID = open_eye_clicked_marker.target.id.substring(8);

    const clickedTQI = tqi_nodes.find((_node) => _node.name === clicked_ID);
    const clickedQA = quality_aspect_nodes.find((_node) => _node.name === clicked_ID);
    const clickedPF = product_factor_nodes.find((_node) => _node.name === clicked_ID);
    const clickedMeasure = measure_nodes.find((_node) => _node.name === clicked_ID);
    const clickedDiagnostic = diagnostic_nodes.find((_node) => _node.name === clicked_ID);
    
    
    if (clickedTQI) {
      let new_tqi_nodes = [];
      new_tqi_nodes = tqi_nodes.map((_node) => {
        if (_node.json_data.name === clickedTQI.json_data.name){
          return redraw_node(_node, false, false);
        }
        else{
          return _node;
        }
      });
      setTQINodes(new_tqi_nodes);
    }
    else if (clickedQA){
      let new_qa_nodes = [];
      new_qa_nodes = quality_aspect_nodes.map((_node) => {
        if (_node.json_data.name === clickedQA.json_data.name){
          return redraw_node(_node, false, false);
        }
        else{
          return _node;
        }
      });
      setQualityAspectNodes(new_qa_nodes);
    }
    else if (clickedPF){
      let new_pf_nodes = [];
      new_pf_nodes = product_factor_nodes.map((_node) => {
        if (_node.json_data.name === clickedPF.json_data.name){
          return redraw_node(_node, true, false);
        }
        else{
          return _node;
        }
      });
      setProductFactorNodes(new_pf_nodes);
    }
    else if (clickedMeasure){
      let new_measure_nodes = [];
      new_measure_nodes = measure_nodes.map((_node) => {
        if (_node.json_data.name === clickedMeasure.json_data.name){
          return redraw_node(_node, false, false);
        }
        else{
          return _node;
        }
      });
      setMeasureNodes(new_measure_nodes);
    }
    else if (clickedDiagnostic){
      let new_diagnostic_nodes = [];
      new_diagnostic_nodes = diagnostic_nodes.map((_node) => {
        if (_node.json_data.name === clickedDiagnostic.json_data.name){
          return redraw_node(_node, false, false);
        }
        else{
          return _node;
        }
      });
      setDiagnosticNodes(new_diagnostic_nodes);
    }    
  }, [open_eye_clicked_marker]);

  // called when a product factor node is pressed to display the appropriate measure nodes in the correct location
  useEffect(() => {

    setMeasureNodes([]);
    setActiveMeasureNode(null);

    if (!active_product_factor_node) { // don't try to operate if there isn't an active node
      return;
    }

    let new_measures : any[] = []; // stores the measure nodes the PF node has weights for

    for (let name in processedData.measures){
      if (active_product_factor_node.json_data.weights[name] !== undefined){
        new_measures.push(processedData.measures[name]);
      }
    }

    setMeasureNodes(create_nodes(new_measures, active_product_factor_node._x + 75, measure_y, false));

  }, [active_product_factor_node]);

   // called when a measure node is pressed to display the appropriate diagnsotic nodes in the correct location
   useEffect(() => {

    setDiagnosticNodes([]);

    if (!active_measure_node) { // don't try to operate if there isn't an active node
      return;
    }

    let new_diagnostics : any[] = []; // stores the measure nodes the PF node has weights for

    for (let name in processedData.diagnostics){
      if (active_measure_node.json_data.weights[name] !== undefined){
        new_diagnostics.push(processedData.diagnostics[name]);
      }
    }

    setDiagnosticNodes(create_nodes(new_diagnostics, active_measure_node._x + 75, diagnostic_y, false));

  }, [active_measure_node]);

  // used to display the updated node lists
  useEffect(() => {

    function set_nodes() {

      // top row of nodes -- function similar to root nodes (only 1 with doctored data file)
      setTQINodes(create_nodes(processedData.factors.tqi, canvas_width / 2, tqi_y, false)); // holds the data of each node

      // second row of nodes -- the children of the tqi nodes
      setQualityAspectNodes(create_nodes(processedData.factors.quality_aspects, canvas_width / 2, quality_aspect_y, false));

      // third row of nodes -- the children of the quality aspect nodes
      setProductFactorNodes(create_nodes(processedData.factors.product_factors, canvas_width / 2, product_factor_y, true));
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

  function reset_selection(){

  }

  function render_nodes_and_edges(){
    return(
      <svg width={canvas_width} height={canvas_height} fill={'green'}>
        {tqi_nodes.map((node : any) => {return node._rect;}) }
        {quality_aspect_nodes.map((node : any) => {return node._rect;}) }
        {product_factor_nodes.map((node : any) => {return node._rect;}) }
        {measure_nodes.map((node : any) => {return node._rect;}) }
        {diagnostic_nodes.map((node : any) => {return node._rect;}) }
        {tqi_edges}
        {qa_edges}
        {pf_edges}
        {PF_up_edges}
        {measure_edges}
      </svg>
    );
  }

  // panning and zooming
  const svgRef = useRef<SVGSVGElement | null>(null);
  const gRef = useRef<SVGGElement | null>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown>>();

  // handles the zooming and panning
  // thank you chatgpt!
  useEffect(() => {

    if (svgRef.current && gRef.current) {

      const svgElement = svgRef.current;
      const g = d3.select<SVGGElement, unknown>(gRef.current);

      const center_start_x = -svgElement.clientWidth / 2 + window.innerWidth / 3;
      const center_start_y = -svgElement.clientHeight / 2 + 450;

      // Set up zoom behavior
      const zoom = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.5, 4])
        .on('zoom', (event) => {
          g.attr('transform', event.transform);
        });

      // Save the zoom behavior in a ref to access it later
      zoomRef.current = zoom;

      // center page when loaded
      const initialTransform = d3.zoomIdentity
        .translate(center_start_x, center_start_y)
        .scale(1);

      // Apply zoom behavior to the svg
      const svg = d3.select<SVGSVGElement, unknown>(svgElement);
      svg.call(zoom);

      // Set initial zoom and position
      svg.call(zoom.transform, initialTransform);

      // Clean up on unmount
      return () => {
        svg.on('.zoom', null);
      };
    }
  }, []);

  // handles the reset zoom button
  const handleResetZoom = () => {
    if (svgRef.current && zoomRef.current) {
      const svgElement = svgRef.current;
      const center_start_x = -svgElement.clientWidth / 2 + window.innerWidth / 3;
      const center_start_y = -svgElement.clientHeight / 2 + 450;
      const resetTransform = d3.zoomIdentity
        .translate(center_start_x, center_start_y)
        .scale(1);

      const svg = d3.select<SVGSVGElement, unknown>(svgElement);
      svg.transition().duration(500).call(zoomRef.current.transform, resetTransform);
    }
  };

  return (

    <div id={'tree_canvas'}>
      <div style={{ marginBottom: '10px', background: 'white'}}>
        <button className={"reset_buttons"} onClick={handleResetZoom}>Reset Zoom</button>
      </div>
      <svg ref={svgRef} width={canvas_width} height={canvas_height}>
        <g ref={gRef}>
          {render_nodes_and_edges()}
        </g>
      </svg>
    </div>
  );

  // TODO: refactor create_nodes() and redraw_node() so they can be moved to helper file

  // creates and returns an array of nodes representing the specified layer
  function create_nodes(_factors : any, _x_pos: number, _y_pos: number, _arrow : boolean){

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
        (
          <g key={_factors[index].name} onClick={node_clicked}>
            <rect height={node_height} width={node_width} x={x} y={y} className={node_id} id={_factors[index].name}/>
            <text x={x + node_width / 2} y={10+y + node_height / 4} className={'node_text'}>
              {_factors[index].name}
            </text>
            <text x={x + node_width / 2} y={10+y + node_height / 2} className={'node_text'}>
              {_factors[index].value.toFixed(2)}
            </text>
            {_arrow ? <>
            <rect id={'uparrow ' + _factors[index].name} onClick={(e) => arrow_clicked(e)} height={15} width={25} x={x} y={y} className={node_id}/>
            <ArrowUpIcon x={x + 5} y={y}/> </> : <></>}
            <rect id={'closedeye ' + _factors[index].name} onClick={(e) => closed_eye_clicked(e)} height={15} width={25} x={x + node_width - 25} y={y} className={node_id}/>
            <EyeClosedIcon x={x + node_width - 20} y={y}/>
          </g>
        ),
        node_width,
        node_height,
        x,
        y
      );
    });
  }

  // accepts a node as an input and redraws it with arrow, open eye, and closed eye icons toggleable
  function redraw_node(_node : any, _arrow : boolean, _open : boolean){

    const x = _node.x;
    const y = _node.y;
    const node_width = _node.width;
    const node_height = _node.height;

    // Determine node color
    let node_id = 'low_node';
    if (_node.json_data.value < 0.2){
      node_id = 'severe_node';
    }
    else if (_node.json_data.value < 0.4){
      node_id = 'high_node';
    }
    else if (_node.json_data.value < 0.6){
      node_id = 'elevated_node';
    }
    else if (_node.json_data.value < 0.8){
      node_id = 'guarded_node';
    }

    return new TreeNode(
      _node.json_data,
      (
          <g key={_node.name} onClick={node_clicked}>
            <rect height={node_height} width={node_width} x={x} y={y} className={node_id} id={_node.json_data.name}/>
            <text x={x + node_width / 2} y={10+y + node_height / 4} className={'node_text'}>
              {_node.json_data.name}
            </text>
            <text x={x + node_width / 2} y={10+y + node_height / 2} className={'node_text'}>
              {_node.json_data.value.toFixed(2)}
            </text>
            {
              _arrow ? <>
              <rect id={'uparrow ' + _node.json_data.name} onClick={(e) => arrow_clicked(e)} height={15} width={25} x={x} y={y} className={node_id}/>
              <ArrowUpIcon x={x + 5} y={y}/> </> : <></>
            }
            {
              _open ?
                <>
                  <rect id={'openeye ' + _node.json_data.name} onClick={(e) => open_eye_clicked(e)} height={15} width={25} x={x + node_width - 25} y={y} className={node_id}/>
                  <EyeOpenIcon x={x + node_width - 20} y={y}/>
                </> :
                <>
                  <rect id={'closedeye ' + _node.json_data.name} onClick={(e) => closed_eye_clicked(e)} height={15} width={25} x={x + node_width - 25} y={y} className={node_id}/>
                  <EyeClosedIcon x={x + node_width - 20} y={y}/>
                </>
            }
          </g>
      ),
      _node.width,
      _node.height,
      x,
      y
    );
  }

} // end of export