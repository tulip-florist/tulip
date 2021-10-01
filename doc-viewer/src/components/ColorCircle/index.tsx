import React from "react";
import { UilMultiply } from "@iconscout/react-unicons";

interface Props {
  active: boolean;
  color: string;
  size?: number;
}

const darkOverlay = "rgba(52, 52, 52, 0.3)";

export const ColorCircle = ({ active, color, size = 3 }: Props) => {
  return (
    <button
      className={`inline-block rounded-full p-1 flex items-center justify-center border-solid border-4`}
      style={{
        height: `${size}rem`,
        width: `${size}rem`,
        backgroundColor: color,
        borderColor: darkOverlay,
      }}
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
