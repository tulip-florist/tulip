import { EpubCFI } from "epubjs";
import React, { useState, useReducer, useCallback, useEffect } from "react";
import SplitPane from "react-split-pane";
import {
  Action,
  FileTypes,
  Annotation as AnnotationType,
  ActionTypes,
  User,
  Doc,
  FileWithHash,
} from "../../types/types";
import Annotation from "../Annotation";
import { AnnotationList } from "../AnnotationList";
import EpubReader from "../EpubReader";
import { EpubAnnotation } from "../EpubReader/types";
import PdfReader from "../PdfReader";
import { PdfAnnotation } from "../PdfReader/types";
import "../../style/reactSplitPane.css";
import * as API from "../../util/api";

interface Props {
  fileWithHash: FileWithHash;
  user?: User;
}

const fileTypes: { pdf: FileTypes; epub: FileTypes } = {
  pdf: "application/pdf",
  epub: "application/epub+zip",
};

const annotationsReducer = (
  annotations: Array<AnnotationType>,
  action: Action
) => {
  switch (action.type) {
    case ActionTypes.CREATE_ANNOTATION: {
      const newId = Math.random().toString();
      const newAnnotation = { ...action.payload.annotation, id: newId };
      const updatedAnnotations: Array<AnnotationType> = [
        ...annotations,
        newAnnotation,
      ];
      return updatedAnnotations;
    }
    case ActionTypes.DELETE_ANNOTATION: {
      const filteredAnnotations = annotations.filter(
        (annotation) => annotation.id !== action.payload.annotationId
      );
      return filteredAnnotations;
    }
    case ActionTypes.UPDATE_ANNOTATION: {
      const updatedAnnotations = annotations.map((annotation) => {
        if (annotation.id === action.payload.annotationId) {
          return {
            ...annotation,
            ...action.payload.propsToUpdate,
          };
        } else {
          return annotation;
        }
      });

      return updatedAnnotations;
    }
    case ActionTypes.SET_ANNOTATIONS: {
      return action.payload.annotations;
    }
    default:
      throw new Error("Not a valid action for annotationReducer");
  }
};

const AnnotationMemo = React.memo(Annotation);

const defaultHighlightColors: Array<string> = [
  "#F9D755",
  "#78D45F",
  "#6FB7F7",
  "#EE7A99",
  "#A78FEB",
];

export const DocumentReader = ({ fileWithHash, user }: Props) => {
  const [annotations, dispatch] = useReducer(annotationsReducer, []);
  const [highlightColors] = useState(defaultHighlightColors);
  const [isSynced, setIsSynced] = useState<boolean>(false);
  const { file, fileHash } = fileWithHash;

  const syncDocumentToServer = useCallback(async () => {
    console.log("sync to server");
    API.setDocument({ hash: fileHash, annotations });
    setIsSynced(true);
  }, [annotations, fileHash]);

  const syncDocumentToLocalStorage = useCallback(async () => {
    const hash = fileHash;
    const doc: Doc = {
      hash,
      annotations,
    };
    localStorage.setItem(hash, JSON.stringify(doc));
    console.log("sync to local storage");
  }, [annotations, fileHash]);

  // Get data for the file from local storage
  useEffect(() => {
    (async () => {
      const storedData = localStorage.getItem(fileHash);
      if (storedData) {
        const doc: Doc = JSON.parse(storedData);
        dispatch({
          type: ActionTypes.SET_ANNOTATIONS,
          payload: { annotations: doc.annotations },
        });
      }
    })();
  }, [fileHash]);

  // On user login, sync data from server
  useEffect(() => {
    (async () => {
      if (!user) return;

      const doc = await API.getDocument({ hash: fileHash });

      if (doc?.annotations) {
        // sync backend to frontend
        dispatch({
          type: ActionTypes.SET_ANNOTATIONS,
          payload: { annotations: doc.annotations },
        });
      }
    })();
  }, [user, fileHash]);

  // Sync to server every n seconds
  useEffect(() => {
    const timer = setInterval(() => syncDocumentToServer(), 10000);
    return () => {
      clearInterval(timer);
    };
  }, [syncDocumentToServer]);

  // Save to local storage every n seconds
  useEffect(() => {
    const timer = setInterval(() => syncDocumentToLocalStorage(), 5000);
    return () => {
      clearInterval(timer);
    };
  }, [syncDocumentToLocalStorage]);

  // Set isSynced to false on every state change
  useEffect(() => {
    setIsSynced(false);
  }, [file, annotations]);

  const [
    scrollToHighlightInDocument,
    setScrollToHighlightInDocument,
  ] = useState<(position: AnnotationType["position"]) => void>(() => () =>
    console.log("scroll to not set")
  );

  const [scrollToAnnotationInList, setScrollToAnnotationInList] = useState<
    ((id: AnnotationType["id"]) => void) | undefined
  >();

  const [focusAnnotationInputInList, setFocusAnnotationInputInList] = useState<
    ((id: AnnotationType["id"]) => void) | undefined
  >();

  const getFileType = (file: File): FileTypes | undefined => {
    if (file.type === "application/pdf") {
      return fileTypes.pdf;
    } else if (file.type === "application/epub+zip") {
      return fileTypes.epub;
    } else {
      return undefined;
    }
  };

  // SCROLL TO'S
  const handleHighlightClick = (annotation: AnnotationType) => {
    if (focusAnnotationInputInList && scrollToAnnotationInList) {
      focusAnnotationInputInList(annotation.id);
      scrollToAnnotationInList(annotation.id);
    }
  };

  const handleAnnotationClick = (annotation: AnnotationType) => {
    scrollToHighlightInDocument(annotation.position);
  };

  // SORTING
  const sortEpubAnnotationsByPositition = (
    ann1: EpubAnnotation,
    ann2: EpubAnnotation
  ) => {
    return new EpubCFI().compare(
      ann1.position.cfiRange,
      ann2.position.cfiRange
    );
  };

  const sortPdfAnnotationsByPosition = (
    { position: pos1 }: PdfAnnotation,
    { position: pos2 }: PdfAnnotation
  ) => {
    if (pos1.pageNumber !== pos2.pageNumber) {
      return pos1.pageNumber - pos2.pageNumber;
    } else if (pos1.boundingRect.y2 !== pos2.boundingRect.y2) {
      return pos1.boundingRect.y2 - pos2.boundingRect.y2;
    } else {
      return pos1.boundingRect.x2 - pos2.boundingRect.x2;
    }
  };

  // HANDLER -> REDUCER DISPATCH
  const handleCreateAnnotation: (
    newAnnotation: Omit<AnnotationType, "id">
  ) => void = (annotation: Omit<AnnotationType, "id">) => {
    dispatch({
      type: ActionTypes.CREATE_ANNOTATION,
      payload: { annotation },
    });
  };

  const handleDeleteAnnotation = (annotationId: string) => {
    dispatch({
      type: ActionTypes.DELETE_ANNOTATION,
      payload: { annotationId },
    });
  };

  const handleAnnotationNoteUpate: (
    annotationId: string,
    note: string
  ) => void = (annotationId, note) => {
    dispatch({
      type: ActionTypes.UPDATE_ANNOTATION,
      payload: { annotationId, propsToUpdate: { note } },
    });
  };

  // MEMO'S
  const handleAnnotationNoteUpateMemo = useCallback(handleAnnotationNoteUpate, [
    dispatch,
  ]);

  const handleDeleteAnnotationMemo = useCallback(handleDeleteAnnotation, [
    dispatch,
  ]);

  const handleScrollToHighlightReadyMemo = useCallback(
    (fn) => {
      setScrollToHighlightInDocument(() => fn);
    },
    [setScrollToHighlightInDocument]
  );

  return (
    <div className="App">
      <SplitPane split="vertical" maxSize={-300} defaultSize={1100}>
        <div className="pr-2 h-full w-full">
          {getFileType(file) === fileTypes.epub ? (
            <EpubReader
              file={file}
              annotations={annotations as Array<EpubAnnotation>}
              highlightColors={highlightColors}
              onCreateAnnotation={handleCreateAnnotation}
              onHighlightClick={handleHighlightClick}
              onScrollToHighlightReady={handleScrollToHighlightReadyMemo}
            />
          ) : (
            <PdfReader
              file={file}
              annotations={annotations as Array<PdfAnnotation>}
              highlightColors={highlightColors}
              onCreateAnnotation={handleCreateAnnotation}
              onHighlightClick={handleHighlightClick}
              onScrollToHighlightReady={handleScrollToHighlightReadyMemo}
            />
          )}
        </div>
        <div className="h-full overflow-y-auto">
          <div className="flex flex-col px-2 py-1">
            <AnnotationList
              annotations={annotations.sort(
                getFileType(file) === fileTypes.epub
                  ? sortEpubAnnotationsByPositition
                  : sortPdfAnnotationsByPosition
              )}
              onScrollToAnnotationReady={useCallback(
                (fn) => setScrollToAnnotationInList(() => fn),
                [setScrollToAnnotationInList]
              )}
              onFocusAnnotationInputReady={useCallback(
                (fn) => setFocusAnnotationInputInList(() => fn),
                [setFocusAnnotationInputInList]
              )}
            >
              {({ annotation, containerRef, inputRef }) => {
                return (
                  <div className="py-1 ..." key={annotation.id}>
                    <AnnotationMemo
                      highlight={annotation.highlight}
                      note={annotation.note}
                      color={annotation.color}
                      containerRef={containerRef}
                      inputRef={inputRef}
                      onNoteChange={(note: string) =>
                        handleAnnotationNoteUpateMemo(annotation.id, note)
                      }
                      onDelete={() => handleDeleteAnnotationMemo(annotation.id)}
                      onClick={() => handleAnnotationClick(annotation)} // TODO
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
};

export default DocumentReader;
