import React, { ReactElement } from "react";

interface Props {
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function FileInput({ handleInputChange }: Props): ReactElement {
  return (
    <>
      <input
        type="file"
        accept="application/pdf, application/epub+zip"
        onChange={handleInputChange}
      />
    </>
  );
}
