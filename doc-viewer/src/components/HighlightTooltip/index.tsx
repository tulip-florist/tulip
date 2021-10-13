import React, { ReactElement } from "react";
import { ColorCircle } from "../ColorCircle";

interface Props {
  highlightColorPickers: Array<ReactElement>;
  menuItems: Array<ReactElement>;
}

const HighlightTooltip = ({ highlightColorPickers, menuItems }: Props) => {
  return (
    <div className="bg-gray-100 rounded-lg p-2 max-w-sm flex flex-col">
      <div className="flex flex-row space-x-2">{highlightColorPickers}</div>
      <div className="border-t-2 my-3" />
      <div className="space-y-1">{menuItems}</div>
    </div>
  );
};

const MenuItem = ({ text, onClick }: { text: string; onClick: () => void }) => (
  <div className="cursor-pointer" onClick={onClick}>
    {text}
  </div>
);

interface DefaultHighlightTooltipProps {
  highlightColors: Array<string>;
  currentHighlightColor: string;
  handleAddNote: (...args: any[]) => void;
  handleDeleteNote: () => void;
  handleHighlightColorClick: (color: string, active: boolean) => void;
}

const DefaultHighlightTooltip = (props: DefaultHighlightTooltipProps) => {
  const {
    highlightColors,
    currentHighlightColor,
    handleAddNote,
    handleDeleteNote,
    handleHighlightColorClick,
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

  const defaultMenuItems: Array<ReactElement> = [
    {
      text: "Add note",
      onClick: handleAddNote,
    },
    {
      text: "Delete note",
      onClick: handleDeleteNote,
    },
  ].map((item) => (
    <MenuItem text={item.text} key={item.text} onClick={item.onClick} />
  ));

  return (
    <HighlightTooltip
      highlightColorPickers={highlightColorPickers}
      menuItems={defaultMenuItems}
    />
  );
};

export { DefaultHighlightTooltip as HighlightTooltip };
