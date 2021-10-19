export interface Color {
  id: string
  hex: string
}

export interface LTWH {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface AnnotationNoId {
  color: string;
  highlight: Highlight;
  note?: string;
  position: PositionPdfText;
}
export interface Annotation extends AnnotationNoId {
  id: string
}

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

export enum ActionTypes {
  CREATE_ANNOTATION = "ADD_ANNOTATION",
  DELETE_ANNOTATION = "DELETE_ANNOTATION",
  SET_ANNOTATIONS = "SET_ANNOTATIONS",
}

export type Action =
  | { type: ActionTypes.CREATE_ANNOTATION; payload: { annotation: AnnotationNoId } }
  | { type: ActionTypes.DELETE_ANNOTATION; payload: { content: string } }
  | {
    type: ActionTypes.SET_ANNOTATIONS;
    payload: { annotations: Array<Annotation> };
  };

export type handleCreateAnnotationType = (newAnnotation: AnnotationNoId) => void
