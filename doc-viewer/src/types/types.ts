export interface Annotation {
  color: string;
  content: string;
  // type: "text" | "area";
  note?: string;
  position: PositionPdfText;
  // sourceType: "pdf" | "epub";
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
}

export type Action =
  | { type: ActionTypes.CREATE_ANNOTATION; payload: { annotation: Annotation } }
  | { type: ActionTypes.DELETE_ANNOTATION; payload: { content: string } };
