import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { Annotation as AnnotationType } from "../../types/types";

interface Props {
  annotations: Array<AnnotationType>;
  children: (args: {
    annotation: AnnotationType;
    containerRef: React.RefObject<HTMLDivElement>;
    inputRef: React.RefObject<HTMLTextAreaElement>;
  }) => React.ReactElement;
  onScrollToAnnotationReady: (fn: (id: AnnotationType["id"]) => void) => void;
  onFocusAnnotationInputReady: (fn: (id: AnnotationType["id"]) => void) => void;
}

export const AnnotationList = <T extends AnnotationType>({
  annotations,
  children,
  onScrollToAnnotationReady,
  onFocusAnnotationInputReady,
}: Props) => {
  const containerRefs = useMemo(
    () =>
      annotations.reduce(
        (
          acc: {
            [key: string]: React.RefObject<HTMLDivElement>;
          },
          it
        ) => {
          acc[it.id] = React.createRef<HTMLDivElement>();
          return acc;
        },
        {}
      ),
    [annotations]
  );

  const inputRefs = useMemo(
    () =>
      annotations.reduce(
        (
          acc: {
            [key: string]: React.RefObject<HTMLTextAreaElement>;
          },
          it
        ) => {
          acc[it.id] = React.createRef<HTMLTextAreaElement>();
          return acc;
        },
        {}
      ),
    [annotations]
  );

  const elements = annotations.map((annotation) => {
    return children({
      annotation: annotation,
      containerRef: containerRefs[annotation.id],
      inputRef: inputRefs[annotation.id],
    });
  });

  const scrollToElementInList = (id: AnnotationType["id"]) => {
    containerRefs[id]?.current?.scrollIntoView({
      behavior: "auto",
      block: "start",
    });
  };

  useEffect(() => {
    onScrollToAnnotationReady(scrollToElementInList);
  }, [annotations, onScrollToAnnotationReady]);

  const focusAnnotationInput = (id: AnnotationType["id"]) => {
    inputRefs[id]?.current?.focus({ preventScroll: false });
  };

  useEffect(() => {
    onFocusAnnotationInputReady(focusAnnotationInput);
  }, [annotations, onFocusAnnotationInputReady]);

  return <>{elements}</>;
};
