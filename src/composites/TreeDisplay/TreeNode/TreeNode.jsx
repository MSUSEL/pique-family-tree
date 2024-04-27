export default class TreeNode {
  constructor(info, width, height, x, y) {
    this.json_data = info;
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.children = [];
  }

  get node_center_x() {
    return this.x + this.width / 2;
  }

  get node_center_y() {
    return this.y + this.height / 2;
  }

  get name() {
    return this.json_data.name;
  }
}
