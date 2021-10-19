import React, { useState, useReducer, ChangeEvent, useCallback } from "react";
import SplitPane from "react-split-pane";
import "../src/style/reactSplitPane.css";
import Annotation from "./components/Annotation";
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

const sortAnnotationsByPositition = (a: AnnotationType, b: AnnotationType) => {
  if (a.position.pageNumber !== b.position.pageNumber) {
    return a.position.pageNumber - b.position.pageNumber;
  } else if (a.position.boundingRect.y2 !== b.position.boundingRect.y2) {
    return a.position.boundingRect.y2 - b.position.boundingRect.y2;
  } else {
    return a.position.boundingRect.x2 - b.position.boundingRect.x2;
  }
};
const AnnotationMemo = React.memo(Annotation);

const defaultHighlightColors: Array<Color> = [
  "#F9D755",
  "#78D45F",
  "#6FB7F7",
  "#EE7A99",
  "#A78FEB",
].map((it) => ({ id: generateUID(), hex: it }));

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [state, dispatch] = useReducer(annotationReducer, {
    annotations: [],
  });
  const [highlightColors, setHighlightColors] = useState(
    defaultHighlightColors
  );

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

  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { files } = event.target;
    const file = files?.[0] || null;
    if (file) {
      setFile(file);
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
        <div className="pr-2">
          {file && (
            <DocumentReader
              file={file}
              handleCreateAnnotation={handleCreateAnnotation}
              highlightColors={highlightColors}
              annotations={state.annotations}
            />
          )}
        </div>
        <div className="h-full overflow-y-auto">
          <div className="flex flex-col px-2 py-1">
            {state.annotations
              .sort(sortAnnotationsByPositition)
              .map((annotation) => {
                return (
                  <div className="py-1 ..." key={annotation.id}>
                    <AnnotationMemo
                      annotation={annotation}
                      onNoteChange={handleAnnotationNoteUpateMemo}
                      onDelete={handleDeleteAnnotationMemo}
                    />
                  </div>
                );
              })}
          </div>
        </div>
      </SplitPane>
    </div>
  );
}

export default App;
