import React, { useState } from "react";
import FileInput from "./FileInput";

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
    </div>
  );
}

export default App;
