export interface Annotation {
  id: string;
  color: string;
  highlight: string;
  note?: string;
  position: any;
}

export type FileTypes = "application/pdf" | "application/epub+zip";

export enum ReaderType {
  PdfReader,
  EpubReader,
}

export enum ActionTypes {
  CREATE_ANNOTATION = "ADD_ANNOTATION",
  DELETE_ANNOTATION = "DELETE_ANNOTATION",
  UPDATE_ANNOTATION = "UPDATE_ANNOTATION",
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
    };
