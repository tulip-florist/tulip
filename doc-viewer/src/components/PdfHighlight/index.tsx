import React from "react";
import { LTWH } from "./types";

import "./Highlight.css";

interface Props {
  position: {
    boundingRect: LTWH;
    rects: Array<LTWH>;
  };
  onClick?: () => void;
  onMouseOver?: () => void;
  onMouseOut?: () => void;
  note: string;
  color: string;
  isScrolledTo: boolean;
}

export const PdfHighlight = ({
  position,
  onClick,
  onMouseOver,
  onMouseOut,
  color,
  isScrolledTo,
}: Props) => {
  const { rects } = position;
  const bgStyle = color ? { backgroundColor: color } : undefined;

  return (
    <div
      className={`Highlight ${isScrolledTo ? "Highlight--scrolledTo" : ""}`}
      style={bgStyle}
    >
      <div className="Highlight__parts">
        {rects.map((rect, index) => (
          <div
            onMouseOver={onMouseOver}
            onMouseOut={onMouseOut}
            onClick={onClick}
            key={index}
            style={{ ...rect, ...bgStyle }}
            className={`Highlight__part`}
          />
        ))}
      </div>
    </div>
  );
};

export default PdfHighlight;
