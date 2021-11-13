import { EpubCFI } from "epubjs";
import React, {
  useState,
  useReducer,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from "react";
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
import {
  compareDocs,
  getFileType,
  LocalStorageAPI,
  SyncUtil,
} from "../../util";
import { v4 as uuidv4 } from "uuid";
import { debounce } from "lodash";
import { useInitialMount } from "../../hooks/useIsInitialMount";
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
      console.log("SET ANOOOOOOOOOOOOOOOOOOS");
      debugger;
      return action.payload.annotations;
    }
    case ActionTypes.CLEAR_ANNOTATIONS: {
      debugger;
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

export const DocumentReader = ({ fileWithHash, user }: Props) => {
  const [annotations, dispatch] = useReducer(annotationsReducer, []);
  const [highlightColors] = useState(defaultHighlightColors);
  const { file, fileHash } = fileWithHash;
  const currentFileHash = useRef(fileWithHash.fileHash);
  const isInitialMount = useInitialMount();
  const SYNC_DEBOUNCE_TIME = 1000; //ms

  const [focusAnnotationInputInList, setFocusAnnotationInputInList] = useState<
    ((id: AnnotationType["id"]) => void) | undefined
  >();

  const [scrollToAnnotationInList, setScrollToAnnotationInList] = useState<
    ((id: AnnotationType["id"]) => void) | undefined
  >();

  // Update current file ref
  useEffect(() => {
    currentFileHash.current = fileWithHash.fileHash;
  }, [fileWithHash]);

  useEffect(() => {
    debugger;
    dispatch({ type: ActionTypes.CLEAR_ANNOTATIONS });
  }, [fileWithHash]);

  // Get data for the file from local storage
  useEffect(() => {
    if (currentFileHash.current !== fileHash) return;
    debugger;
    const doc = LocalStorageAPI.getDocument(fileHash);
    console.log("++++ Set data from local storage");
    if (doc) {
      dispatch({
        type: ActionTypes.SET_ANNOTATIONS,
        payload: { annotations: doc.annotations },
      });
    }
  }, [fileHash]);

  // const syncDocOnlyIfLocallyChanged = useCallback(
  //   async (doc: Doc): Promise<Doc | undefined> => {
  //     const currentDoc: Doc = { documentHash: fileHash, annotations };
  //     const lastSyncedDoc = LocalStorageAPI.getSyncedVersionOfDocument(
  //       fileHash
  //     );
  //     if (compareDocs(currentDoc, lastSyncedDoc || undefined)) return undefined;

  //     console.log("Docs are different!, Syncing...");

  //     const syncedDoc = await SyncUtil.syncDocWithBackend(currentDoc);

  //     return syncedDoc;
  //   },
  //   [annotations, fileHash]
  // );

  // // On user login, sync data from server
  // useEffect(() => {
  //   (async () => {
  //     if (!user) return;

  //     const syncedDoc = SyncUtil.syncDocWithBackend({documentHash: fileHash, annotations})

  //     // const doc = await API.getDocument(fileHash);

  //     // if (doc?.annotations) {
  //     //   // sync backend to frontend
  //     //   dispatch({
  //     //     type: ActionTypes.SET_ANNOTATIONS,
  //     //     payload: { annotations: doc.annotations },
  //     //   });
  //     // }
  //   })();
  // }, [user, fileHash]);

  const syncServerDebounce = useMemo(() => {
    const sync = (annotations: any, fileHash: any) => {
      const currentDoc: Doc = { documentHash: fileHash, annotations };
      SyncUtil.syncDocWithBackend(currentDoc).then((syncedDoc) => {
        dispatch({
          type: ActionTypes.SET_ANNOTATIONS,
          payload: { annotations: syncedDoc.annotations },
        });
      });
    };
    return debounce(sync, SYNC_DEBOUNCE_TIME);
  }, []);

  useEffect(() => {
    return () => {
      syncServerDebounce.cancel();
    };
  }, [syncServerDebounce]);

  // Sync data when annotations change (with debounce)
  useEffect(() => {
    debugger;
    if (currentFileHash.current !== fileHash) return;

    if (isInitialMount) return;
    const currentDoc: Doc = { documentHash: fileHash, annotations };

    // First, save app state to local storage
    LocalStorageAPI.setDocument(currentDoc);
    debugger;
    // Check if user exists, else return
    if (!user) return;

    // If lastSynced is the same as the current app state, do nothing
    const lastSyncedDoc = LocalStorageAPI.getSyncedVersionOfDocument(fileHash);
    const docsAreSame = compareDocs(currentDoc, lastSyncedDoc || undefined);

    debugger;
    if (docsAreSame) return;
    console.log("++++about to sync to server");
    debugger;

    // Else, merge the 3 states, update lastSynced, return the merged object and update the app state
    syncServerDebounce(annotations, fileHash);
  }, [annotations, fileHash, isInitialMount, syncServerDebounce, user]);

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

  return (
    <div className="App">
      <SplitPane split="vertical" maxSize={-300} defaultSize={1100}>
        <div className="pr-2 h-full w-full">
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
        <div className="h-full overflow-y-auto">
          <div className="flex flex-col px-2 py-1">
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
                        onDelete={() =>
                          handleDeleteAnnotationMemo(annotation.id)
                        }
                        onClick={() => handleAnnotationClick(annotation)} // TODO
                      />
                    </div>
                  );
                }}
              </AnnotationList>
            )}
          </div>
        </div>
      </SplitPane>
    </div>
  );
};

export default DocumentReader;

// Hook
function useDebounce(value: any, delay: any) {
  // State and setters for debounced value
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(
    () => {
      // Update debounced value after delay
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);
      // Cancel the timeout if value changes (also on delay change or unmount)
      // This is how we prevent debounced value from updating if value is changed ...
      // .. within the delay period. Timeout gets cleared and restarted.
      return () => {
        clearTimeout(handler);
      };
    },
    [value, delay] // Only re-call effect if value or delay changes
  );
  return debouncedValue;
}
