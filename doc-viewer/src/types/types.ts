export interface Color {
  id: string;
  hex: string;
}

export interface LTWH {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface Annotation {
  id: string;
  color: string;
  highlight: Highlight;
  note?: string;
  position: PositionPdfText | PositionEpub;
}

export interface PdfAnnotation extends Annotation {
  position: PositionPdfText;
}

export interface EpubAnnotation extends Annotation {
  position: PositionEpub;
}

type TypeWithNoId<T> = {
  [Property in keyof T as Exclude<Property, "id">]: T[Property];
};

export type AnnotationNoId = TypeWithNoId<Annotation>;

export interface Highlight {
  text?: string;
  image?: string;
}

export interface Scaled {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  width: number;
  height: number;
}

export interface PositionPdfText {
  // type: "pdf/text";
  boundingRect: Scaled;
  rects: Array<Scaled>;
  pageNumber: number;
  usePdfCoordinates?: boolean;
}

export interface PositionEpub {
  cfiRange: string;
}

export enum FileTypes {
  Pdf,
  Epub,
}

export enum ActionTypes {
  CREATE_ANNOTATION = "ADD_ANNOTATION",
  DELETE_ANNOTATION = "DELETE_ANNOTATION",
  UPDATE_ANNOTATION = "UPDATE_ANNOTATION",
}

export type Action =
  | {
      type: ActionTypes.CREATE_ANNOTATION;
      payload: { annotation: AnnotationNoId };
    }
  | { type: ActionTypes.DELETE_ANNOTATION; payload: { annotationId: string } }
  | {
      type: ActionTypes.UPDATE_ANNOTATION;
      payload: { annotationId: string; propsToUpdate: Partial<AnnotationNoId> };
    };

// FUNCTION SIGNATURE TYPES

export type handleCreateAnnotationSignature = (
  newAnnotation: AnnotationNoId
) => void;

export type handleAnnotationNoteUpateSignature = (
  annotationId: string,
  note: string
) => void;
