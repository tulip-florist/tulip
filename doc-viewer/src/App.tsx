import React, { useState } from "react";
import DocumentReader from "./components/DocumentReader";
import FileInput from "./components/FileInput";

function App() {
  const [file, setFile] = useState<File | null>(null);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    const file = files?.[0] || null;
    if (file) {
      setFile(file);
      console.log("file input change", files);
    }
  };

  return (
    <div className="App">
      <h1>Hello World</h1>
      <FileInput handleInputChange={handleInputChange} />
      {file && <DocumentReader file={file} />}
    </div>
  );
}

export default App;
