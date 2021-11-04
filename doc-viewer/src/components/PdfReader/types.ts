export interface PdfAnnotation {
  id: string;
  color: string;
  highlight: string;
  note?: string;
  position: Position;
}

export type PdfAnnotationNoId = TypeWithNoId<PdfAnnotation>;

type TypeWithNoId<T> = {
  [Property in keyof T as Exclude<Property, "id">]: T[Property];
};

export interface Scaled {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  width: number;
  height: number;
}

export interface Position {
  // type: "pdf/text";
  boundingRect: Scaled;
  rects: Array<Scaled>;
  pageNumber: number;
  usePdfCoordinates?: boolean;
}
