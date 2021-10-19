import React, { useState, useReducer } from "react";
import SplitPane from "react-split-pane";
import "../src/style/reactSplitPane.css";
import AnnotationList from "./components/AnnotationList";
import DocumentReader from "./components/DocumentReader";
import FileInput from "./components/FileInput";
import {
  AnnotationNoId,
  Color,
  handleCreateAnnotationType,
} from "./types/types";
import { Action, ActionTypes, Annotation } from "./types/types";

interface State {
  annotations: Array<Annotation>;
}

const annotationReducer = (state: State, action: Action) => {
  switch (action.type) {
    case ActionTypes.CREATE_ANNOTATION:
      const newId = Math.random().toString();
      const newAnnotation = { ...action.payload.annotation, id: newId };
      const updatedAnnotation: Array<Annotation> = [
        ...state.annotations,
        newAnnotation,
      ];
      return {
        ...state,
        annotations: updatedAnnotation,
      };
    case ActionTypes.SET_ANNOTATIONS:
      return {
        ...state,
        annotations: action.payload.annotations,
      };
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

  const handleCreateAnnotation: handleCreateAnnotationType = (
    annotation: AnnotationNoId
  ) => {
    dispatch({ type: ActionTypes.CREATE_ANNOTATION, payload: { annotation } });
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
          <AnnotationList
            annotations={state.annotations}
            setAnnotations={(annotations) =>
              dispatch({
                type: ActionTypes.SET_ANNOTATIONS,
                payload: { annotations },
              })
            }
          />
        </div>
      </SplitPane>
    </div>
  );
}

export default App;
