export interface Annotation {
  id: string;
  color: string;
  highlight: string;
  note?: string;
  position: any;
}


export enum FileTypes {
  pdf = "application/pdf",
  epub = "application/epub+zip"
}

export enum ReaderType {
  PdfReader,
  EpubReader,
}

export enum ActionTypes {
  CREATE_ANNOTATION = "ADD_ANNOTATION",
  DELETE_ANNOTATION = "DELETE_ANNOTATION",
  UPDATE_ANNOTATION = "UPDATE_ANNOTATION",
  SET_ANNOTATIONS = "SET_ANNOTATION",
  CLEAR_ANNOTATIONS = "CLEAR_ANNOTATIONS"
}

export type Action =
  | {
      type: ActionTypes.CREATE_ANNOTATION;
      payload: { annotation: Omit<Annotation, "id"> };
    }
  | { type: ActionTypes.DELETE_ANNOTATION; payload: { annotationId: string } }
  | {
      type: ActionTypes.UPDATE_ANNOTATION;
      payload: {
        annotationId: string;
        propsToUpdate: Partial<Omit<Annotation, "id">>;
      };
    }
  | {
      type: ActionTypes.SET_ANNOTATIONS;
      payload: { annotations: Array<Annotation> };
    }
  | {
    type: ActionTypes.CLEAR_ANNOTATIONS
  }

export interface User {
  id: string;
}

export interface Doc {
  documentHash: string;
  annotations: Array<Annotation>;
}

export interface FileWithHash {
  file: File;
  fileHash: string;
}
