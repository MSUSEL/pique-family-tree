/**
 * Return the correct node from the PIQUE .json output file.
 *
 * @param fileData PIQUE .json output file.
 * @param clicked_ID ID of the clicked description clicker box.
 */
export function findPIQUENode(fileData, clicked_ID) {
  const split_clicked_ID = clicked_ID.split("^");

  const node_type = split_clicked_ID[1];
  const node_name = split_clicked_ID[2];

  const jsonDepthDecider =
    node_type === "measures" || node_type === "diagnostics" ? 0 : 1;

  if (jsonDepthDecider === 1) {
    return fileData.factors[node_type][node_name];
  } else if (jsonDepthDecider === 0) {
    return fileData[node_type][node_name];
  }
}

/**
 * Determines the color of the description clicker (the box in the top right corner of each node)
 * Shouldn't be a costly algorithm since there are a max 100+ description clickers on screen, and
 * the side panel can only hold <= 5 nodes... so max ~500 comparisons
 *
 * @param nodesForPanelBoxes the nodes in the side panel
 * @param selected_id ID of description clicker box that was clicked
 */
export function determineDescriptionClickerColor(
  nodesForPanelBoxes,
  selected_id
) {
  const panel_names = nodesForPanelBoxes.map((node) => node.name);

  const id_name = selected_id.split("^")[1];

  if (panel_names.includes(id_name)) return "transparent";
  else return "transparent";
}

export function determineDescriptionClickerBorder(
  nodesForPanelBoxes,
  selected_id
) {
  const panel_names = nodesForPanelBoxes.map((node) => node.name);

  const id_name = selected_id.split("^")[1];

  if (panel_names.includes(id_name)) return "transparent";
  else return "transparent";
}

export function determineDescriptionClickerIcon(
  nodesForPanelBoxes,
  selected_id
) {
  const panel_names = nodesForPanelBoxes.map((node) => node.name);
  const openedIcon = btoa(`
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7.5 11C4.80285 11 2.52952 9.62184 1.09622 7.50001C2.52952 5.37816 4.80285 4 7.5 4C10.1971 4 12.4705 5.37816 13.9038 7.50001C12.4705 9.62183 10.1971 11 7.5 11ZM7.5 3C4.30786 3 1.65639 4.70638 0.0760002 7.23501C-0.0253338 7.39715 -0.0253334 7.60288 0.0760014 7.76501C1.65639 10.2936 4.30786 12 7.5 12C10.6921 12 13.3436 10.2936 14.924 7.76501C15.0253 7.60288 15.0253 7.39715 14.924 7.23501C13.3436 4.70638 10.6921 3 7.5 3ZM7.5 9.5C8.60457 9.5 9.5 8.60457 9.5 7.5C9.5 6.39543 8.60457 5.5 7.5 5.5C6.39543 5.5 5.5 6.39543 5.5 7.5C5.5 8.60457 6.39543 9.5 7.5 9.5Z" fill="currentColor"/>
    </svg>
`);

  const closedIcon = btoa(`
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M13.3536 2.35355C13.5488 2.15829 13.5488 1.84171 13.3536 1.64645C13.1583 1.45118 12.8417 1.45118 12.6464 1.64645L10.6828 3.61012C9.70652 3.21671 8.63759 3 7.5 3C4.30786 3 1.65639 4.70638 0.0760002 7.23501C-0.0253338 7.39715 -0.0253334 7.60288 0.0760014 7.76501C0.902945 9.08812 2.02314 10.1861 3.36061 10.9323L1.64645 12.6464C1.45118 12.8417 1.45118 13.1583 1.64645 13.3536C1.84171 13.5488 2.15829 13.5488 2.35355 13.3536L4.31723 11.3899C5.29348 11.7833 6.36241 12 7.5 12C10.6921 12 13.3436 10.2936 14.924 7.76501C15.0253 7.60288 15.0253 7.39715 14.924 7.23501C14.0971 5.9119 12.9769 4.81391 11.6394 4.06771L13.3536 2.35355ZM9.90428 4.38861C9.15332 4.1361 8.34759 4 7.5 4C4.80285 4 2.52952 5.37816 1.09622 7.50001C1.87284 8.6497 2.89609 9.58106 4.09974 10.1931L9.90428 4.38861ZM5.09572 10.6114L10.9003 4.80685C12.1039 5.41894 13.1272 6.35031 13.9038 7.50001C12.4705 9.62183 10.1971 11 7.5 11C6.65241 11 5.84668 10.8639 5.09572 10.6114Z"
  fill="#49475B"/>
  </svg>

`);
  const id_name = selected_id.split("^")[1];

  if (panel_names.includes(id_name)) return openedIcon;
  else return closedIcon;
}

export function determineParentClickerColor(
  nodeWithParentShowing,
  selected_id
) {
  const id_name = selected_id.split("^")[1];

  if (nodeWithParentShowing === id_name) return "transparent";
  else return "transparent";
}

export function determineParentClickerBorder(
  nodeWithParentShowing,
  selected_id
) {
  const id_name = selected_id.split("^")[1];

  if (nodeWithParentShowing === id_name) return "transparent";
  else return "transparent";
}
