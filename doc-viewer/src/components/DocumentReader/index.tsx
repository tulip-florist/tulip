import { ReactElement, useEffect, useState } from "react";
import PdfReader from "../PdfReader";
import EpubReader from "../EpubReader";
import {
  Annotation,
  EpubAnnotation,
  handleCreateAnnotationSignature,
} from "../../types/types";
import { Color } from "../../types/types";

interface Props {
  file: File;
  handleCreateAnnotation: handleCreateAnnotationSignature;
  highlightColors: Array<Color>;
  annotations: Array<Annotation>;
  handleClickOnHighlight?: (...args: any[]) => void;
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
  handleClickOnHighlight,
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
          handleClickOnHighlight={handleClickOnHighlight}
        />
      ) : (
        <EpubReader
          file={file}
          highlightColors={highlightColors}
          annotations={annotations as Array<EpubAnnotation>}
          handleCreateAnnotation={handleCreateAnnotation}
        />
      )}
    </>
  );
}
