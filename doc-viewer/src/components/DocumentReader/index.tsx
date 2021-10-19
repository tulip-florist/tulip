import { ReactElement, useEffect, useState } from "react";
import PdfReader from "../PdfReader";
import EpubReader from "../EpubReader";
import {
  Annotation,
  AnnotationNoId,
  handleCreateAnnotationType,
} from "../../types/types";
import { Color } from "../../types/types";

interface Props {
  file: File;
  handleCreateAnnotation: handleCreateAnnotationType;
  highlightColors: Array<Color>;
  annotations: Array<Annotation>;
}

enum Reader {
  PdfReader,
  EpubReader,
}

export default function DocumentReader({
  file,
  handleCreateAnnotation,
  highlightColors,
  annotations,
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
          annotations={annotations}
          handleCreateAnnotation={handleCreateAnnotation}
          highlightColors={highlightColors}
        />
      ) : (
        <EpubReader file={file} />
      )}
    </>
  );
}
