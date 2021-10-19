import { ChangeEvent, ReactElement } from "react";
import { Annotation as AnnotationType } from "../../types/types";
import Annotation from "../Annotation";

interface Props {
  annotations: Array<AnnotationType>;
  setAnnotations: (annotations: Array<AnnotationType>) => void;
}

export default function AnnotationList({
  annotations,
  setAnnotations,
}: Props): ReactElement {
  const updateAnnotations = (
    annotationId: AnnotationType["id"],
    note: AnnotationType["note"]
  ): void => {
    const newAnnotations = annotations.map((annotation) =>
      annotation.id === annotationId ? { ...annotation, note } : annotation
    );
    setAnnotations(newAnnotations);
  };

  const deleteAnnotation = (annotationId: AnnotationType["id"]): void => {
    const newAnnotations = annotations.filter(
      (annotation) => annotation.id !== annotationId
    );
    setAnnotations(newAnnotations);
  };

  const sortedAnnotations = () => {
    const sortedAnnotations = annotations.sort((a, b) => {
      if (a.position.pageNumber !== b.position.pageNumber) {
        return a.position.pageNumber - b.position.pageNumber;
      } else if (a.position.boundingRect.y2 !== b.position.boundingRect.y2) {
        return a.position.boundingRect.y2 - b.position.boundingRect.y2;
      } else {
        return a.position.boundingRect.x2 - b.position.boundingRect.x2;
      }
    });
    return sortedAnnotations;
  };

  return (
    <>
      <div className="flex flex-col px-2 py-1">
        {sortedAnnotations().map((annotation) => {
          return (
            <div className="py-1 ..." key={annotation.id}>
              <Annotation
                annotation={annotation}
                onNoteChange={(
                  event: ChangeEvent<HTMLTextAreaElement>
                ): void => {
                  const note: string = event.target.value;
                  updateAnnotations(annotation.id, note);
                }}
                onDelete={(annotationId) => {
                  deleteAnnotation(annotationId);
                }}
              />
            </div>
          );
        })}
      </div>
    </>
  );
}
