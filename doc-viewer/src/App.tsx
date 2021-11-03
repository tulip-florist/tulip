import { EpubCFI } from "epubjs";
import React, { useState, useReducer, useCallback, useRef } from "react";
import SplitPane from "react-split-pane";
import "../src/style/reactSplitPane.css";
import Annotation from "./components/Annotation";
import { AnnotationList } from "./components/AnnotationList";
import DocumentReader from "./components/DocumentReader";
import FileInput from "./components/FileInput";
import {
  AnnotationNoId,
  Color,
  handleAnnotationNoteUpateSignature,
  handleCreateAnnotationSignature,
  Action,
  ActionTypes,
  Annotation as AnnotationType,
  PdfAnnotation,
  EpubAnnotation,
  FileTypes,
} from "./types/types";
interface State {
  annotations: Array<AnnotationType>;
}

const annotationReducer = (state: State, action: Action) => {
  switch (action.type) {
    case ActionTypes.CREATE_ANNOTATION: {
      const newId = Math.random().toString();
      const newAnnotation = { ...action.payload.annotation, id: newId };
      const updatedAnnotations: Array<AnnotationType> = [
        ...state.annotations,
        newAnnotation,
      ];
      return {
        ...state,
        annotations: updatedAnnotations,
      };
    }
    case ActionTypes.DELETE_ANNOTATION: {
      const filteredAnnotations = state.annotations.filter(
        (annotation) => annotation.id !== action.payload.annotationId
      );
      return { ...state, annotations: filteredAnnotations };
    }
    case ActionTypes.UPDATE_ANNOTATION: {
      const updatedAnnotations = state.annotations.map((it) => {
        if (it.id === action.payload.annotationId) {
          return {
            ...it,
            ...action.payload.propsToUpdate,
          };
        } else {
          return it;
        }
      });

      return { ...state, annotations: updatedAnnotations };
    }
    default:
      throw new Error("Not a valid action for annotationReducer");
  }
};

function generateUID() {
  const firstPart = ("000" + ((Math.random() * 46656) | 0).toString(36)).slice(
    -3
  );
  const secondPart = ("000" + ((Math.random() * 46656) | 0).toString(36)).slice(
    -3
  );
  return firstPart + secondPart;
}

const AnnotationMemo = React.memo(Annotation);

const defaultHighlightColors: Array<Color> = [
  "#F9D755",
  "#78D45F",
  "#6FB7F7",
  "#EE7A99",
  "#A78FEB",
].map((it) => ({ id: generateUID(), hex: it }));

export const GlobalContext = React.createContext({
  scrollToFn: (position: AnnotationType["position"]) => {},
  setScrollToFn: (...args: any[]) => {},
});

function App() {
  const [file, setFile] = useState<File | null>(null);
  const fileType = useRef<FileTypes>();
  const [state, dispatch] = useReducer(annotationReducer, {
    annotations: [],
  });
  const [highlightColors, setHighlightColors] = useState(
    defaultHighlightColors
  );
  const [scrollToFn, setScrollToFn] = useState<
    (position: AnnotationType["position"]) => void
  >(() => () => console.log("scroll to not set"));

  const setFileType = (file: File) => {
    if (file.type === "application/pdf") {
      fileType.current = FileTypes.Pdf;
    } else if (file.type === "application/epub+zip") {
      fileType.current = FileTypes.Epub;
    } else {
      fileType.current = undefined;
    }
  };

  const [scrollToAnnotationInList, setScrollToAnnotationInList] = useState<
    ((id: AnnotationType["id"]) => void) | undefined
  >();

  const [focusAnnotationInput, setFocusAnnotationInput] = useState<
    ((id: AnnotationType["id"]) => void) | undefined
  >();

  const handleCreateAnnotation: handleCreateAnnotationSignature = (
    annotation: AnnotationNoId
  ) => {
    dispatch({ type: ActionTypes.CREATE_ANNOTATION, payload: { annotation } });
  };

  const handleDeleteAnnotation = (annotationId: string) => {
    dispatch({
      type: ActionTypes.DELETE_ANNOTATION,
      payload: { annotationId },
    });
  };

  const handleAnnotationNoteUpate: handleAnnotationNoteUpateSignature = (
    annotationId,
    note
  ) => {
    dispatch({
      type: ActionTypes.UPDATE_ANNOTATION,
      payload: { annotationId, propsToUpdate: { note } },
    });
  };

  const sortAnnotationsByPositition = (
    ann1: AnnotationType,
    ann2: AnnotationType
  ) => {
    switch (fileType.current) {
      case FileTypes.Epub:
        return new EpubCFI().compare(
          (ann1 as EpubAnnotation).position.cfiRange,
          (ann2 as EpubAnnotation).position.cfiRange
        );

      case FileTypes.Pdf:
        const pdfAPos1: PdfAnnotation["position"] = (ann1 as PdfAnnotation)
          .position;
        const pdfAPos2: PdfAnnotation["position"] = (ann2 as PdfAnnotation)
          .position;

        if (pdfAPos1.pageNumber !== pdfAPos2.pageNumber) {
          return pdfAPos1.pageNumber - pdfAPos2.pageNumber;
        } else if (pdfAPos1.boundingRect.y2 !== pdfAPos2.boundingRect.y2) {
          return pdfAPos1.boundingRect.y2 - pdfAPos2.boundingRect.y2;
        } else {
          return pdfAPos1.boundingRect.x2 - pdfAPos2.boundingRect.x2;
        }

      default:
        return 0;
    }
  };

  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { files } = event.target;
    const file = files?.[0] || null;
    if (file) {
      setFile(file);
      setFileType(file);
      console.log("file input change", files);
    }
  };

  const handleAnnotationNoteUpateMemo = useCallback(handleAnnotationNoteUpate, [
    dispatch,
  ]);

  const handleDeleteAnnotationMemo = useCallback(handleDeleteAnnotation, [
    dispatch,
  ]);

  return (
    <div className="App">
      <h1>Tulip 🌷</h1>
      <FileInput handleInputChange={handleFileInputChange} />
      <SplitPane split="vertical" maxSize={-300} defaultSize={1100}>
        <div className="pr-2 h-full w-full">
          {file && (
            <GlobalContext.Provider value={{ scrollToFn, setScrollToFn }}>
              <DocumentReader
                file={file}
                handleCreateAnnotation={handleCreateAnnotation}
                highlightColors={highlightColors}
                annotations={state.annotations}
                handleClickOnHighlight={(id: AnnotationType["id"]) => {
                  if (focusAnnotationInput && scrollToAnnotationInList) {
                    focusAnnotationInput(id);
                    scrollToAnnotationInList(id);
                  }
                }}
              />
            </GlobalContext.Provider>
          )}
        </div>
        <div className="h-full overflow-y-auto">
          <div className="flex flex-col px-2 py-1">
            <AnnotationList
              annotations={state.annotations.sort(sortAnnotationsByPositition)}
              onScrollToAnnotationReady={useCallback(
                (fn) => setScrollToAnnotationInList(() => fn),
                [setScrollToAnnotationInList]
              )}
              onFocusAnnotationInputReady={useCallback(
                (fn) => setFocusAnnotationInput(() => fn),
                [setFocusAnnotationInput]
              )}
            >
              {({ annotation, containerRef, inputRef }) => {
                return (
                  <div className="py-1 ..." key={annotation.id}>
                    <AnnotationMemo
                      annotation={annotation}
                      onNoteChange={handleAnnotationNoteUpateMemo}
                      onDelete={handleDeleteAnnotationMemo}
                      onClick={(annotation: AnnotationType) =>
                        scrollToFn(annotation.position)
                      }
                      containerRef={containerRef}
                      inputRef={inputRef}
                    />
                  </div>
                );
              }}
            </AnnotationList>
          </div>
        </div>
      </SplitPane>
    </div>
  );
}

export default App;
