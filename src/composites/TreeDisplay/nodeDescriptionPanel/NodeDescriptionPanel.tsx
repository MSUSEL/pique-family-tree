import "./NodeDescriptionPanel.css";
import { useEffect, useState, useMemo, useRef } from "react";
import { determineNodeInfo } from "./NodeDescriptionPanelHelpers";
import { EyeOpenIcon, EyeNoneIcon } from "@radix-ui/react-icons";

export default function NodeDescriptionPanel(props: { nodes: any[]; impacts: any; setSelectedNode: Function }) {
  const [orderBy, setOrderBy] = useState<string>("default");
  const [orderDirection, setOrderDirection] = useState<string>("asc");
  const [newestNodeIndex, setNewestNodeIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [resizing, setResizing] = useState(false);
  const [selectedNodeIndex, setSelectedNodeIndex] = useState<number | null>(null);

  const handleMouseDown = () => {
    setResizing(true);
  };

  const handleMouseUp = () => {
    setResizing(false);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (resizing) {
      const newWidth = document.body.clientWidth - e.clientX;
      document.getElementById("node_description_panel").style.width = `${newWidth}px`;
    }
  };

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [resizing]);

  useEffect(() => {
    if (newestNodeIndex !== null && scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    }
  }, [newestNodeIndex]);

  const makeNodePanelRectangles = useMemo(() => {
    let orderedNodes = [...props.nodes];

    switch (orderBy) {
      case "default":
        break;
      case "alphabetical":
        orderedNodes.sort((a, b) =>
          orderDirection === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
        );
        break;
      case "value":
        orderedNodes.sort((a, b) => (orderDirection === "asc" ? a.value - b.value : b.value - a.value));
        break;
      default:
        break;
    }

    const index = orderedNodes.findIndex((node) => node === props.nodes[props.nodes.length - 1]);
    setNewestNodeIndex(index);

    return orderedNodes.map((node, i) => (
      <div
        key={i}
        className={`node-panel${i === index ? " highlight" : ""}`}
        ref={i === index ? scrollRef : undefined}
      >
        <div className="eye-icon" onClick={() => {
          setSelectedNodeIndex(i);
          props.setSelectedNode(node.name);
        }}>
          {selectedNodeIndex === i ? <EyeOpenIcon /> : <EyeNoneIcon />}
        </div>
        {determineNodeInfo(node, props.impacts)}
      </div>
    ));
  }, [props.nodes, orderBy, orderDirection, props.impacts, props.setSelectedNode, selectedNodeIndex]);

  const handleOrderByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setOrderBy(e.target.value);
  };

  const handleOrderDirectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setOrderDirection(e.target.value);
  };

  return (
    <div id="node_description_panel" className={`scrollable-panel ${resizing ? "resizable" : ""}`}>
      <div id="resize-handle" onMouseDown={handleMouseDown}></div>
      <label htmlFor="orderBy" style={{ marginLeft: "1%" }}> Order By: </label>
      <select id="orderBy" value={orderBy} onChange={handleOrderByChange}>
        <option value="default">Insertion Order</option>
        <option value="alphabetical">Alphabetical Order</option>
        <option value="value">Value Order</option>
      </select>

      {(orderBy === "alphabetical" || orderBy === "value") && (
        <>
          <label htmlFor="orderDirection"> Order Direction: </label>
          <select id="orderDirection" value={orderDirection} onChange={handleOrderDirectionChange}>
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </>
      )}

      {makeNodePanelRectangles}
    </div>
  );
}
