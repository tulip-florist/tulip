import React from "react";
import { UilMultiply } from "@iconscout/react-unicons";

interface Props {
  active: boolean;
  color: string;
  size?: number;
  onClick: (color: string, active: boolean) => void;
}

const darkOverlay = "rgba(52, 52, 52, 0.3)";

export const ColorCircle = ({ active, color, size = 3, onClick }: Props) => {
  return (
    <button
      className={`rounded-full p-1 flex items-center justify-center border-solid border-4`}
      style={{
        height: `${size}rem`,
        width: `${size}rem`,
        backgroundColor: color,
        borderColor: darkOverlay,
      }}
      onClick={() => onClick(color, active)}
    >
      {active && (
        <UilMultiply
          style={{ height: "100%", width: "100%" }}
          color={darkOverlay}
        />
      )}
    </button>
  );
};
