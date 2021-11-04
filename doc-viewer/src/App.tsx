import React, { useState } from "react";
import DocumentReader from "./components/DocumentReader/DocumentReader";
import FileInput from "./components/FileInput";
const App = () => {
  const [file, setFile] = useState<File | null>(null);

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
    <div>
      <h1>Tulip 🌷</h1>
      <FileInput handleInputChange={handleFileInputChange} />
      {file && <DocumentReader file={file} />}
    </div>
  );
};

export default App;
