import { ReactElement, useEffect, useState } from "react";
import PdfReader from "../PdfReader";
import EpubReader from "../EpubReader";
import { Annotation } from "../../types/types";

interface Props {
  file: File;
  handleCreateAnnotation: (annotation: Annotation) => void;
}

enum Reader {
  PdfReader,
  EpubReader,
}

export default function DocumentReader({
  file,
  handleCreateAnnotation,
}: Props): ReactElement {
  const [reader, setReader] = useState<Reader | null>();

  useEffect(() => {
    const selectReader = () => {
      if (file.type === "application/pdf") {
        setReader(Reader.PdfReader);
      } else if (file.type === "application/epub+zip") {
        setReader(Reader.EpubReader);
      } else {
        setReader(null);
      }
    };
    selectReader();
  }, [file]);

  return (
    <>
      {reader === Reader.PdfReader ? (
        <PdfReader
          file={file}
          handleCreateAnnotation={handleCreateAnnotation}
        />
      ) : (
        <EpubReader file={file} />
      )}
    </>
  );
}
