// used to declare the types of the tree node for type safety
declare module "./TreeNode/TreeNode.jsx" {
  export default class TreeNode {
    constructor(info: any, width: number, height: number, x: number, y: number);
    readonly json_data: any;
    readonly width: number;
    readonly height: number;
    readonly x: number;
    readonly y: number;
    readonly children: TreeNode[];
    readonly node_center_x: number;
    readonly node_center_y: number;
    readonly name: string;
  }
}

export {};