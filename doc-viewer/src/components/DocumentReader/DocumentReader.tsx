import { EpubCFI } from "epubjs";
import React, {
  useState,
  useReducer,
  useCallback,
  useEffect,
  useRef,
} from "react";
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
import { getFileType } from "../../util";
import { v4 as uuidv4 } from "uuid";
import Split from "react-split";

interface Props {
  fileWithHash: FileWithHash;
  user: User | null;
}

const annotationsReducer = (
  annotations: Array<AnnotationType>,
  action: Action
) => {
  switch (action.type) {
    case ActionTypes.CREATE_ANNOTATION: {
      const newAnnotation = { ...action.payload.annotation, id: uuidv4() };
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
    case ActionTypes.CLEAR_ANNOTATIONS: {
      return [];
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

const splitPaneConfig = {
  ratioLeft: 75, // "ratioRight" = 100 - ratioLeft
  gutterStrokeWidth: 2, // pixels
  gutterPadding: 12, // pixels
  minAnnoPanelWidth: 250, // pixels
  minDocPanelWidth: 500, // pixels
};

export const DocumentReader = ({ fileWithHash, user }: Props) => {
  const [annotations, dispatch] = useReducer(annotationsReducer, []);
  const [highlightColors] = useState(defaultHighlightColors);
  const { file, fileHash } = fileWithHash;
  const currentFileHash = useRef(fileWithHash.fileHash);

  const [focusAnnotationInputInList, setFocusAnnotationInputInList] = useState<
    ((id: AnnotationType["id"]) => void) | undefined
  >();

  const [scrollToAnnotationInList, setScrollToAnnotationInList] = useState<
    ((id: AnnotationType["id"]) => void) | undefined
  >();

  const syncDocumentToServer = useCallback(async () => {
    console.log("sync to server");
    API.setDocument({ documentHash: fileHash, annotations });
  }, [annotations, fileHash]);

  const syncDocumentToLocalStorage = useCallback(async () => {
    const doc: Doc = {
      documentHash: fileHash,
      annotations,
    };
    localStorage.setItem(fileHash, JSON.stringify(doc));
    console.log("sync to local storage");
  }, [annotations, fileHash]);

  // Update current file ref
  useEffect(() => {
    console.log(fileWithHash.fileHash, currentFileHash.current);
    currentFileHash.current = fileWithHash.fileHash;
  }, [fileWithHash]);

  useEffect(() => {
    dispatch({ type: ActionTypes.CLEAR_ANNOTATIONS });
  }, [fileWithHash]);

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

      const doc = await API.getDocument(fileHash);

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

  const [
    scrollToHighlightInDocument,
    setScrollToHighlightInDocument,
  ] = useState<(position: AnnotationType["position"]) => void>(() => () =>
    console.log("scroll to not set")
  );

  const setScrollToAnnotationInListCallback = useCallback(
    (fn) => setScrollToAnnotationInList(() => fn),
    [setScrollToAnnotationInList]
  );

  const setFocusAnnotationInputInListCallback = useCallback(
    (fn) => setFocusAnnotationInputInList(() => fn),
    [setFocusAnnotationInputInList]
  );

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

  const handleDragEnd = () => {
    window.dispatchEvent(new Event("resize"));
  };

  return (
    <>
      <Split
        sizes={[splitPaneConfig.ratioLeft, 100 - splitPaneConfig.ratioLeft]}
        minSize={[
          splitPaneConfig.minDocPanelWidth,
          splitPaneConfig.minAnnoPanelWidth,
        ]}
        expandToMin={true}
        gutterStyle={(dimension, gutterSize, index) => {
          const gutterWidth =
            splitPaneConfig.gutterPadding * 2 +
            splitPaneConfig.gutterStrokeWidth;
          return {
            height: "100%",
            width: `${gutterWidth}px`,
            borderLeft: `${splitPaneConfig.gutterPadding}px solid white`,
            borderRight: `${splitPaneConfig.gutterPadding}px solid white`,
            backgroundColor: "#d2d2d2",
          };
        }}
        dragInterval={1}
        direction="horizontal"
        className="h-full w-full flex flex-row pr-1"
        onDragEnd={handleDragEnd}
      >
        <div className="w-full h-full">
          {getFileType(file) === FileTypes.epub ? (
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
        <div className="h-full w-full overflow-y-scroll">
          {fileWithHash.fileHash === currentFileHash.current && (
            <AnnotationList
              annotations={annotations.sort(
                getFileType(file) === FileTypes.epub
                  ? sortEpubAnnotationsByPositition
                  : sortPdfAnnotationsByPosition
              )}
              onScrollToAnnotationReady={setScrollToAnnotationInListCallback}
              onFocusAnnotationInputReady={
                setFocusAnnotationInputInListCallback
              }
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
          )}
        </div>
      </Split>
    </>
  );
};

export default DocumentReader;
