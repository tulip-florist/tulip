import { useState, ReactElement, useEffect } from "react";
import { EpubView } from "react-reader";

interface Props {
  file: File;
}

export default function EpubReader({ file }: Props): ReactElement {
  const [location, setLocation] = useState<number | string | undefined>(
    undefined
  );
  const [url, setUrl] = useState<ArrayBuffer | null>(null);

  const locationChanged = (epubcifi: any) => {
    // epubcifi is a internal string used by epubjs to point to a location in an epub. It looks like this: epubcfi(/6/6[titlepage]!/4/2/12[pgepubid00003]/3:0)
    setLocation(epubcifi);
  };

  useEffect(() => {
    const convertFile = async () => {
      const arrBuf = await file.arrayBuffer();
      setUrl(arrBuf);
    };
    setUrl(null);
    convertFile();
  }, [file]);

  return (
    <>
      <div style={{ height: "80vh" }}>
        {url && (
          <EpubView
            locationChanged={locationChanged}
            location={location}
            url={url}
          />
        )}
      </div>
    </>
  );
}
