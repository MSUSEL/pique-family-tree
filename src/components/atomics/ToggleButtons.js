import React from "react";
import { Button, ButtonGroup } from "@blueprintjs/core";
import * as R from "ramda";
// interface ToggleButtonProps<T> {
//   items: T[];
//   defaultItem: T;
// . itemText: (item: T) => string;
//   selectedItem?: T;
//   onChange: (item: T) => void;
//
// }
export const ToggleButton = ({
  items,
  defaultItem,
  itemText = (d) => d,
  onChange,
  selectedItem,
}) => {
  return (
    <ButtonGroup>
      {items.map((item, idx) => {
        const isSelected = R.isNil(selectedItem)
          ? item === defaultItem
          : item === selectedItem;
        return (
          <Button
            key={idx}
            active={isSelected}
            onClick={onChange && (() => onChange(item))}
          >
            {itemText(item)}
          </Button>
        );
      })}
    </ButtonGroup>
  );
};
