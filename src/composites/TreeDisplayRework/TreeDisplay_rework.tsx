// imports and code copied from https://airbnb.io/visx/trees for testing

import React, { useMemo } from 'react';
import { Group } from '@visx/group';
import { Tree, hierarchy } from '@visx/hierarchy';
import { HierarchyPointNode } from '@visx/hierarchy/lib/types';
import { LinkHorizontal } from '@visx/shape';
import { LinkVertical } from '@visx/shape';
import { LinearGradient } from '@visx/gradient';

const peach = '#fd9b93';
const pink = '#fe6e9e';
const blue = '#03c0dc';
const green = '#26deb0';
const plum = '#71248e';
const lightpurple = '#374469';
const white = '#ffffff';
export const background = '#272b4d';

// project imports
import TreeNode from "./TreeNode/TreeNode.jsx";
import { Color } from 'd3';
import { Rect } from 'reactflow';

const node_width = 120;
const node_height = 60;

interface TreeNode {
  name: string;
  children?: this[];
}

type HierarchyNode = HierarchyPointNode<TreeNode>;

// tree construction
const rawTree: TreeNode = {
  name: 'T',
  children: [
    {
      name: 'A',
      children: [
        { name: 'A1' },
        { name: 'A2' },
        { name: 'A3' },
        {
          name: 'C',
          children: [
            {
              name: 'C1',
            },
            {
              name: 'D',
              children: [
                {
                  name: 'D1',
                },
                {
                  name: 'D2',
                },
                {
                  name: 'D3',
                },
              ],
            },
          ],
        },
      ],
    },
    { name: 'Z' },
    {
      name: 'B',
      children: [{ name: 'B1' }, { name: 'B2' }, { name: 'B3' }],
    },
  ],
};

function RootNode({ node }: { node: HierarchyNode }) {
  return (
    <Group top={node.x} left={node.y}>
      <circle r={30} fill="url('#lg')" />
      <text
        dy=".33em"
        fontSize={9}
        fontFamily="Arial"
        textAnchor="middle"
        style={{ pointerEvents: 'none' }}
        fill={plum}
      >
        {node.data.name}
      </text>
    </Group>
  );
}

function ParentNode({ node }: { node: HierarchyNode }) {
  const width = node_width;
  const height = node_height;
  const centerX = -width / 2;
  const centerY = -height / 2;

  return (
    <Group top={node.x} left={node.y}>
      <rect
        height={height}
        width={width}
        y={centerY}
        x={centerX}
        fill={background}
        stroke={blue}
        strokeWidth={1}
        onClick={() => {
          alert(`clicked: ${JSON.stringify(node.data.name)}`);
        }}
      />
      <text
        dy=".33em"
        fontSize={9}
        fontFamily="Arial"
        textAnchor="middle"
        style={{ pointerEvents: 'none' }}
        fill={white}
      >
        {node.data.name}
      </text>
    </Group>
  );
}

/** Handles rendering Root, Parent, and other Nodes. */
function Node({ node }: { node: HierarchyNode }) {
  const width = node_width;
  const height = node_height;
  const centerX = -width / 2;
  const centerY = -height / 2;
  const isRoot = node.depth === 0;
  const isParent = !!node.children; // `!!` typecasts the node to a bool

  if (isRoot) return <RootNode node={node} />;
  if (isParent) return <ParentNode node={node} />;

  return (
    <Group top={node.x} left={node.y}>
      <rect
        height={height}
        width={width}
        y={centerY}
        x={centerX}
        fill={background}
        stroke={green}
        strokeWidth={1}
        strokeDasharray="2,2"
        strokeOpacity={0.6}
        rx={10}
        onClick={() => {
          alert(`clicked: ${JSON.stringify(node.data.name)}`);
        }}
      />
      <text
        dy=".33em"
        fontSize={9}
        fontFamily="Arial"
        textAnchor="middle"
        fill={green}
        style={{ pointerEvents: 'none' }}
      >
        {node.data.name}
      </text>
    </Group>
  );
}

const defaultMargin = { top: 10, left: 80, right: 80, bottom: 10 };

export type TreeProps = {
  width: number;
  height: number;
  margin?: { top: number; right: number; bottom: number; left: number };
};

const min_width = 400; // the min width at which to render the tree
let width = 900; // width of the background
let height = 500; // height of the background
let margin = defaultMargin;

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

  console.log(_processedData);

  // top row of nodes -- function similar to root nodes (only 1 with doctored data file)
  const tqi_nodes : any[] = create_nodes(_processedData.fileData.factors.tqi); // holds the data of each node
  const tqi_rects : any[] = create_rects(tqi_nodes, 100); // holds the actual rect objects do be drawn in the svg
  console.log(tqi_nodes[0]);

  // second row of nodes -- the children of the tqi nodes
  const quality_aspect_nodes : any[] = create_nodes(_processedData.fileData.factors.quality_aspects);
  const quality_aspect_rects : any[] = create_rects(quality_aspect_nodes, 250);

  // third row of nodes -- the children of the quality aspect nodes
  const product_factor_nodes : any[] = create_nodes(_processedData.fileData.factors.product_factors);
  const product_factor_rects : any[] = create_rects(product_factor_nodes, 400);

  // start of example code -- edits have been made
  const data = useMemo(() => hierarchy(rawTree), []);
  const yMax = height - margin.top - margin.bottom;
  const xMax = width - margin.left - margin.right;

  // notes:
  // rx is the curvature of the rect

  return width < min_width ? null : (

    // I need a way to dynamically write the html to draw the nodes
    <svg width={width} height={height}>
      <rect width={width} height={height} rx={10} fill={background} />
      {tqi_rects}
      {quality_aspect_rects}
      {product_factor_rects}
    </svg>
  

    /*
    <svg width={width} height={height}>
      <LinearGradient id="lg" from={peach} to={pink} />
      <rect width={width} height={height} rx={10} fill={background} />
      <Tree<TreeNode> root={data} size={[yMax, xMax]}>
        {(tree) => (
          <Group top={margin.top} left={margin.left}>
            {tree.links().map((link, i) => (
              <LinkHorizontal // draws the path between
                key={`link-${i}`}
                data={link}
                stroke={lightpurple}
                strokeWidth="1"
                fill="none"
              />
            ))}
            {tree.descendants().map((node, i) => (
              <Node key={`node-${i}`} node={node} />
            ))}
          </Group>
        )}
      </Tree>
    </svg>
    */
  );
} // end of export

// creates and returns an array of nodes representing the specified layer
function create_nodes(_factors : any){

  let nodes : any = [];

  const node_x = width / 2 - node_width / 2;
  const node_y = 15;

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
    rects.push(
      <g key={node.name}>
        <rect height={node_height} width={node_width} x={x} y={y} fill={green}/>
        <text x={x + node_width / 2} y={y + node_height / 4} dominantBaseline="middle" textAnchor="middle" fontSize={10}>
          {node.name}
        </text>
        <text x={x + node_width / 2} y={y + node_height / 2} dominantBaseline="middle" textAnchor="middle" fontSize={10}>
          {node.json_data.value}
        </text>
      </g>
    );
  });

  return rects;
}