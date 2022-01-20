import React, {
  useState,
  useReducer,
  useCallback,
  useEffect,
  useMemo,
  useContext,
} from "react";
import {
  FileTypes,
  Annotation as AnnotationType,
  ActionTypes,
  User,
  Doc,
  FileWithHash,
} from "../../types/types";
import Annotation from "../Annotation";
import { AnnotationList } from "../AnnotationList";
import EpubReader, { sortEpubAnnotationsByPositition } from "../EpubReader";
import { EpubAnnotation } from "../EpubReader/types";
import PdfReader, { sortPdfAnnotationsByPosition } from "../PdfReader";
import { PdfAnnotation } from "../PdfReader/types";
import { compareDocs, getFileType } from "../../util";
import Split from "react-split";
import { debounce } from "lodash";
import { useInitialMount } from "../../hooks/useIsInitialMount";
import { annotationsReducer } from "../../util/reducers";
import { defaultSplitPaneProps } from "../../util/split";
import { LocalStorageAPI } from "../../util/LocalStorageAPI";
import { SyncUtil } from "../../util/sync/SyncUtil";
import { useIsDocSynced } from "../../hooks/useIsDocSynced";
import { SyncStatus } from "../SyncStatus";
import { toast } from "react-toastify";
import { UserContext } from "../../App";
import { toastConfig } from "../../util/toast";

interface Props {
  fileWithHash: FileWithHash;
  user: User | null;
}

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
  const isInitialMount = useInitialMount();
  const SYNC_DEBOUNCE_TIME = 1000; //ms
  const [loadedStateFromLS, setLoadedStateFromLS] = useState(false);
  const { setUser } = useContext(UserContext);

  const isSynced = useIsDocSynced(fileWithHash.fileHash);

  const [focusAnnotationInputInList, setFocusAnnotationInputInList] = useState<
    ((id: AnnotationType["id"]) => void) | undefined
  >();

  const [scrollToAnnotationInList, setScrollToAnnotationInList] = useState<
    ((id: AnnotationType["id"]) => void) | undefined
  >();

  // Get data for the file from local storage
  useEffect(() => {
    (async () => {
      const doc = await LocalStorageAPI.getDocument(fileHash);
      if (doc) {
        dispatch({
          type: ActionTypes.SET_ANNOTATIONS,
          payload: { annotations: doc.annotations },
        });
      }
      setLoadedStateFromLS(true);
    })();
  }, [fileHash]);

  const syncServerDebounce = useMemo(() => {
    const sync = (annotations: any, fileHash: any) => {
      const currentDoc: Doc = { documentHash: fileHash, annotations };
      SyncUtil.syncDocWithBackend(currentDoc)
        .then((syncedDoc) => {
          dispatch({
            type: ActionTypes.SET_ANNOTATIONS,
            payload: { annotations: syncedDoc.annotations },
          });
        })
        .catch(async (syncError) => {
          // unable to refresh token
          toast.error("Session expired, please login again", toastConfig);
          setUser(null);
        });
    };
    return debounce(sync, SYNC_DEBOUNCE_TIME);
  }, [setUser]);

  useEffect(() => {
    return () => {
      syncServerDebounce.cancel();
    };
  }, [syncServerDebounce]);

  // Sync data when annotations change (with debounce)
  useEffect(() => {
    (async () => {
      if (isInitialMount || !loadedStateFromLS) return;

      const currentDoc: Doc = { documentHash: fileHash, annotations };

      // First, save app state to local storage
      await LocalStorageAPI.setDocument(currentDoc);
      // Check if user exists, else return
      if (!user) return;

      // If lastSynced is the same as the current app state, do nothing
      const lastSyncedDoc = await LocalStorageAPI.getSyncedVersionOfDocument(
        fileHash
      );
      const docsAreSame = compareDocs(currentDoc, lastSyncedDoc || undefined);
      if (docsAreSame) return;
      // Else, merge the 3 states, update lastSynced, return the merged object and update the app state
      syncServerDebounce(annotations, fileHash);
    })();
  }, [
    annotations,
    fileHash,
    isInitialMount,
    loadedStateFromLS,
    syncServerDebounce,
    user,
  ]);

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
    <>
      <Split
        {...defaultSplitPaneProps}
        className={"h-full w-full flex flex-row pr-1"}
        onDragEnd={() => window.dispatchEvent(new Event("resize"))}
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
          <div className="p-0.5 top-0 sticky bg-white flex justify-center">
            <SyncStatus status={isSynced} />
          </div>

          <AnnotationList
            annotations={annotations.sort(
              getFileType(file) === FileTypes.epub
                ? sortEpubAnnotationsByPositition
                : sortPdfAnnotationsByPosition
            )}
            onScrollToAnnotationReady={setScrollToAnnotationInListCallback}
            onFocusAnnotationInputReady={setFocusAnnotationInputInListCallback}
          >
            {({ annotation, containerRef, inputRef }) => {
              return (
                <div className="pr-1.5 ..." key={annotation.id}>
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
      </Split>
    </>
  );
};

export default DocumentReader;
