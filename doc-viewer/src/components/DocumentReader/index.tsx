import React, { ReactElement } from "react";
import PdfReader from "../PdfReader";

interface Props {
  file: File;
}

export default function DocumentViewer({ file }: Props): ReactElement {
  const viewer = selectViewer(file);

  return (
    <>
      <h3>Doc viewer</h3>
      {viewer}
    </>
  );
}

function selectViewer(file: File) {
  console.log("selectViwer", file);
  let viewer: any = null;
  if (file.type === "application/pdf") {
    viewer = <PdfReader file={file} />;
  } else if (file.type === "application/epub+zip") {
    viewer = "epub";
  } else {
    viewer = null;
  }
  return viewer;
}
