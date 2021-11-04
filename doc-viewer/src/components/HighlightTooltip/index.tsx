import React, { ReactElement } from "react";
import { ColorCircle } from "../ColorCircle";

interface Props {
  highlightColorPickers: Array<ReactElement>;
  menuItems: Array<ReactElement>;
}

const HighlightTooltip = ({ highlightColorPickers, menuItems }: Props) => {
  const menuItemsElement = (
    <>
      <div className="border-t-2 my-3" />
      <div className="space-y-1">{menuItems}</div>
    </>
  );

  return (
    <div className="bg-gray-100 rounded-lg p-2 max-w-sm flex flex-col">
      <div className="flex flex-row space-x-2">{highlightColorPickers}</div>
      {menuItems && menuItems.length > 0 && menuItemsElement}
    </div>
  );
};

interface DefaultHighlightTooltipProps {
  highlightColors: Array<string>;
  currentHighlightColor?: string;
  onColorClick: (color: string, active: boolean) => void;
}

const DefaultHighlightTooltip = (props: DefaultHighlightTooltipProps) => {
  const {
    highlightColors,
    currentHighlightColor,
    onColorClick: handleHighlightColorClick,
  }: DefaultHighlightTooltipProps = props;

  const highlightColorPickers = highlightColors.map((color) => {
    const isActive: boolean = color === currentHighlightColor;
    return (
      <ColorCircle
        color={color}
        key={color}
        active={isActive}
        size={2}
        onClick={() => handleHighlightColorClick(color, isActive)}
      />
    );
  });

  const defaultMenuItems: Array<ReactElement> = [];

  return (
    <HighlightTooltip
      highlightColorPickers={highlightColorPickers}
      menuItems={defaultMenuItems}
    />
  );
};

export { DefaultHighlightTooltip as HighlightTooltip };
