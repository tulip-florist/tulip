import React, { useState, useReducer } from "react";
import SplitPane from "react-split-pane";
import "../src/style/reactSplitPane.css";
import AnnotationList from "./components/AnnotationList";
import DocumentReader from "./components/DocumentReader";
import FileInput from "./components/FileInput";
import { Action, ActionTypes, Annotation } from "./types/types";

interface State {
  annotations: Array<Annotation>;
}

const annotationReducer = (state: State, action: Action) => {
  switch (action.type) {
    case ActionTypes.CREATE_ANNOTATION:
      return {
        ...state,
        annotations: [...state.annotations, action.payload.annotation],
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

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [state, dispatch] = useReducer(annotationReducer, {
    annotations: [],
  });

  const handleCreateAnnotation = (annotation: Annotation) => {
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
