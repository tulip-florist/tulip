// import {
//   getDocument,
//   GlobalWorkerOptions,
//   version,
// } from "pdfjs-dist/legacy/build/pdf";
// import ePub from "epubjs";

// export const extractPdfMetaData = async (file: File) => {
//   if (file.type !== "application/pdf") {
//     throw Error("Provided files is not a PDF file");
//   }

//   GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.js`;

//   const pdfDocument = await getDocument(URL.createObjectURL(file)).promise;
//   const metadata = await pdfDocument.getMetadata();
//   console.log(metadata, null, 2);
//   console.log(pdfDocument.fingerprints);
// };

// const readFileAsArrayBuffer = async (file: File) => {
//   if (!window.FileReader) {
//     throw new Error("Coud not load Epub file data");
//   }

//   let fileData: string | ArrayBuffer | null = await new Promise((resolve) => {
//     var reader = new FileReader();
//     reader.onload = (e) => resolve(reader.result);
//     reader.readAsArrayBuffer(file);
//   });

//   return fileData;
// };

// export const extractEpubMetaData = async (file: File) => {
//   if (file.type !== "application/epub+zip") {
//     throw Error("Provided files is not a PDF file");
//   }

//   const epubData = await readFileAsArrayBuffer(file);

//   if (!epubData) {
//     throw Error("Could not load Epub aata");
//   }

//   const epubBook = ePub(epubData);
//   console.log("ebook", epubBook);
// };

export const getFileHash = async (file: File) => {
    // https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest#converting_a_digest_to_a_hex_string
    const digest = await crypto.subtle.digest(
      "SHA-256",
      await file.arrayBuffer()
    );
    const hashArray = Array.from(new Uint8Array(digest)); // convert buffer to byte array
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join(""); // convert bytes to hex string
    return hashHex;
  };