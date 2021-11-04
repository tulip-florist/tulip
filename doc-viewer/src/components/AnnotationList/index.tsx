import React, { useCallback, useEffect, useMemo } from "react";
import { EpubAnnotation } from "../EpubReader/types";
import { PdfAnnotation } from "../PdfReader/types";

interface Props<T extends PdfAnnotation | EpubAnnotation> {
  annotations: Array<T>;
  children: (args: {
    annotation: T;
    containerRef: React.RefObject<HTMLDivElement>;
    inputRef: React.RefObject<HTMLTextAreaElement>;
  }) => React.ReactElement;
  onScrollToAnnotationReady: (fn: (id: T["id"]) => void) => void;
  onFocusAnnotationInputReady: (fn: (id: T["id"]) => void) => void;
}

export function AnnotationList<T extends PdfAnnotation | EpubAnnotation>({
  annotations,
  children,
  onScrollToAnnotationReady,
  onFocusAnnotationInputReady,
}: Props<T>) {
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

  const scrollToElementInList = useCallback(
    (id: T["id"]) => {
      containerRefs[id]?.current?.scrollIntoView({
        behavior: "auto",
        block: "start",
      });
    },
    [containerRefs]
  );

  useEffect(() => {
    onScrollToAnnotationReady(scrollToElementInList);
  }, [annotations, onScrollToAnnotationReady, scrollToElementInList]);

  const focusAnnotationInput = useCallback(
    (id: T["id"]) => {
      inputRefs[id]?.current?.focus({ preventScroll: false });
    },
    [inputRefs]
  );

  useEffect(() => {
    onFocusAnnotationInputReady(focusAnnotationInput);
  }, [annotations, focusAnnotationInput, onFocusAnnotationInputReady]);

  return <>{elements}</>;
}
