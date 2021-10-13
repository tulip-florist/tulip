import React, { useState, useReducer } from "react";
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
      <div className="grid grid-cols-12 grid-rows-1">
        <div className="col-span-8">
          {file && (
            <DocumentReader
              file={file}
              handleCreateAnnotation={handleCreateAnnotation}
            />
          )}
        </div>
        <div className="col-span-4 bg-gray-300">
          <ul>
            {state.annotations.map((it) => (
              <p className="my-6">{it.content}</p>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
