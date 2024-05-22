import { EyeOpenIcon, EyeClosedIcon, ArrowUpIcon } from "@radix-ui/react-icons";

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
  let parent_x = _parent._rect.props.children[0].props.x + _parent._rect.props.children[0].props.width / 2;
  let parent_y = _parent._rect.props.children[0].props.y + _parent._rect.props.children[0].props.height;
  
  //children.forEach(function(_child){
  return _children.map((_child : any) => {
  
    // get childrens x and y coord
    let child_x = _child._rect.props.children[0].props.x + _child._rect.props.children[0].props.width / 2;
    let child_y = _child._rect.props.children[0].props.y;
  
    // calc control points
    let x1 = parent_x;
    let y1 = (parent_y + child_y) / 2;
  
    let x2 = child_x;
    let y2 = y1;
    // draws bezier curve
    // the surrounding conditional ensures it only draws edges with weights - this was the problem that was causing crashes
    // when the 'hide weight' quick action switch was pressed.
    // the id for each edge is the parent node name concatenated with the child node name without a space
    // note: i need a messy conditional here because the 'side' attribute of the <textPath> is not supported in 
    //      any browsers besides firefox; so my rememdy is to reverse the start and endpoints of the path manually
    if (_parent.json_data.weights[_child._rect.key] !== undefined){
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
  let parent_x = _parent._rect.props.children[0].props.x + _parent._rect.props.children[0].props.width / 2;
  let parent_y = _parent._rect.props.children[0].props.y;
  
  //children.forEach(function(_child){
  return _children.map((_child : any) => {
  
    // get childrens x and y coord
    let child_x = _child._rect.props.children[0].props.x + _child._rect.props.children[0].props.width / 2;
    let child_y = _child._rect.props.children[0].props.y + _child._rect.props.children[0].props.height;
  
    // calc control points
    let x1 = parent_x;
    let y1 = (parent_y + child_y) / 2;
  
    let x2 = child_x;
    let y2 = y1;
    // draws bezier curve
    // the id for each edge is the parent node name concatenated with the child node name without a space
    // note: i need a messy conditional here because the 'side' attribute of the <textPath> is not supported in 
    //      any browsers besides firefox; so my rememdy is to reverse the start and endpoints of the path manually
    if (_child.json_data.weights[_parent._rect.key] !== undefined){
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

// accepts a node as an input and redraws it with arrow, open eye, and closed eye icons toggleable
export function redraw_node(_node : any, _arrow : boolean, _open : boolean){

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