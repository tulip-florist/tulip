import React, { useState } from "react";
import DocumentReader from "./components/DocumentReader/DocumentReader";
import FileInput from "./components/FileInput";
import { hashFile } from "./util";
const App = () => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileInputChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { files } = event.target;
    const file = files?.[0] || null;
    if (file) {
      setFile(file);
      console.log("file input change: ", files);

      const fileHash = await hashFile(file);
      console.log("fileHash", fileHash);
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
