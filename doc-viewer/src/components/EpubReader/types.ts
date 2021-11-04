export interface EpubAnnotation {
  id: string;
  color: string;
  highlight: string;
  note?: string;
  position: Position;
}

export type EpubAnnotationNoId = TypeWithNoId<EpubAnnotation>;

type TypeWithNoId<T> = {
  [Property in keyof T as Exclude<Property, "id">]: T[Property];
};

export interface Position {
  cfiRange: string;
}
