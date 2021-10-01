import { ReactElement, useEffect, useState } from "react";
import PdfReader from "../PdfReader";
import EpubReader from "../EpubReader";

interface Props {
  file: File;
}

enum Viewer {
  PdfViewer,
  EpubViewer,
}

export default function DocumentViewer({ file }: Props): ReactElement {
  const [viewer, setViewer] = useState<Viewer | null>();

  useEffect(() => {
    const selectViewer = () => {
      if (file.type === "application/pdf") {
        setViewer(Viewer.PdfViewer);
      } else if (file.type === "application/epub+zip") {
        setViewer(Viewer.EpubViewer);
      } else {
        setViewer(null);
      }
    };
    selectViewer();
  }, [file]);

  return (
    <>
      {viewer === Viewer.PdfViewer ? (
        <PdfReader file={file} />
      ) : (
        <EpubReader file={file} />
      )}
    </>
  );
}
