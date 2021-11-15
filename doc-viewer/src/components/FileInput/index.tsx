import React, { ReactElement } from "react";

interface Props {
  value?: File;
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function FileInput({
  value,
  handleInputChange,
}: Props): ReactElement {
  return (
    <div className="inline-block">
      <div className="flex justify-center align-middle items-center">
        <label className="border border-gray-400 bg-gray-100 rounded-sm inline-block py-0.5 px-1 cursor-pointer text-sm text-bold">
          <input
            type="file"
            accept="application/pdf, application/epub+zip"
            onChange={handleInputChange}
            className="hidden"
          />
          Choose file
        </label>
        <span className="inline ml-1 text-sm truncate overflow-ellipsis overflow-hidden max-w-sm">
          {value ? value.name : "No file chosen"}
        </span>
      </div>
    </div>
  );
}
