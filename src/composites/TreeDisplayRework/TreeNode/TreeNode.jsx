export default class TreeNode {
  constructor(info, rect, width, height, x, y) {
    this.json_data = info;
    this._rect = rect;
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.children = [];
  }

  get rect(){
    return this.rect;
  }

  set rect(rect){
    this._rect = _rect;
  }

  set x(x){
    this._x = x;
  }

  set y(y){
    this._y = y;
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