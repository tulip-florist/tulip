import { useState, ReactElement, useEffect, useRef, useCallback } from "react";
import ePub, { Book, Contents, EpubCFI, Rendition } from "epubjs";
import { UilAngleLeftB, UilAngleRightB } from "@iconscout/react-unicons";
import { HighlightTooltip } from "../HighlightTooltip";
import { EpubAnnotation, EpubAnnotationNoId } from "./types";

interface Props {
  file: File;
  annotations: Array<EpubAnnotation>;
  highlightColors: Array<string>;
  onCreateAnnotation: (newAnnotation: EpubAnnotationNoId) => void;
  onHighlightClick?: (annotation: EpubAnnotation) => void;
  onScrollToHighlightReady: (
    fn: (position: EpubAnnotation["position"]) => void
  ) => void;
}

export default function EpubReader({
  file,
  annotations,
  highlightColors,
  onCreateAnnotation: handleCreateAnnotation,
  onHighlightClick: handleClickOnHighlight,
  onScrollToHighlightReady,
}: Props): ReactElement {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [book, setBook] = useState<Book>();
  const [rendition, setRendition] = useState<Rendition | null>(null);
  const [showHTooltip, setShowHTooltip] = useState<boolean>(false);
  const [hTooltipPos, setHTooltipPos] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });
  const currSelection = useRef<{
    cfiRange: string;
    highlight: string;
    contents: Contents;
  }>();
  const hTooltipRef = useRef<HTMLDivElement>(null);

  const calulateHTooltipPosition = (
    mouseX: number,
    mouseY: number
  ): { x: number; y: number } => {
    const tooltip = hTooltipRef.current;
    const viewer = viewerRef.current;

    if (!viewer || !tooltip) return { x: 0, y: 0 };

    const maxX = viewer.scrollWidth - tooltip.offsetWidth;
    const maxY = viewer.scrollHeight - tooltip.offsetHeight;

    const pos = {
      x: mouseX > maxX ? maxX : mouseX,
      y: mouseY > maxY ? maxY : mouseY,
    };
    return pos;
  };

  const clearCurrSelection = () => {
    setShowHTooltip(false);
    currSelection.current?.contents.window.getSelection()?.removeAllRanges();
    currSelection.current = undefined;
  };

  const navigateRendition = useCallback(
    (navDirection: number) => {
      if (!rendition) return;
      clearCurrSelection();
      if (navDirection === -1) {
        rendition.prev();
      } else if (navDirection === 1) {
        rendition.next();
      }
    },
    [rendition]
  );

  const handleKeyUp = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        navigateRendition(-1);
      } else if (e.key === "ArrowRight") {
        navigateRendition(1);
      }
    },
    [navigateRendition]
  );

  const createHighlightInDoc = useCallback(
    (annotation: EpubAnnotation) => {
      rendition?.annotations.highlight(
        annotation.position.cfiRange,
        undefined,
        () => {
          if (handleClickOnHighlight) handleClickOnHighlight(annotation);
        },
        undefined,
        { fill: annotation.color }
      );
    },
    [rendition, handleClickOnHighlight]
  );

  const removeHighlightInDoc = useCallback(
    (annotation: EpubAnnotation) => {
      rendition?.annotations.remove(annotation.position.cfiRange, "highlight");
    },
    [rendition]
  );

  const handleHighlightColorClick = (color: string) => {
    if (!currSelection.current) return;
    handleCreateAnnotation({
      position: { cfiRange: currSelection.current.cfiRange },
      color,
      highlight: currSelection.current.highlight,
    });

    clearCurrSelection();
  };

  const onSelectionChanged = useCallback(
    (cfiRange: string, contents: Contents) => {
      if (!book) return;
      book.getRange(cfiRange).then((range) => {
        currSelection.current = {
          cfiRange,
          highlight: range.toString(),
          contents,
        };
      });
    },
    [book]
  );

  const handleMouseUp = useCallback(
    (event: MouseEvent) => {
      // wait to make sure that currSelection was set by selectionChanged().
      // This is necessary because the "selected" event of epubjs is randomly
      // triggered several times during the text selection and not only at
      // the end(=mouse up)

      setTimeout(() => {
        if (
          !viewerRef.current ||
          !currSelection.current ||
          !hTooltipRef.current
        ) {
          return;
        }

        const highlightingTooltipPos = calulateHTooltipPosition(
          event.pageX,
          event.pageY
        );
        setHTooltipPos(highlightingTooltipPos);
        setShowHTooltip(true);
      }, 350);
    },
    [currSelection]
  );

  const handleMouseDown = useCallback(() => {
    clearCurrSelection();
  }, []);

  useEffect(() => {
    if (!file) return;
    if (window.FileReader) {
      var reader = new FileReader();
      reader.onload = (e: any) => {
        const bookData = e.target.result;
        const book_ = ePub(bookData);
        setBook(book_);
      };
      reader.readAsArrayBuffer(file);
    }
  }, [file]);

  useEffect(() => {
    if (!book) return;

    const node = viewerRef.current;
    if (!node) return;
    node.innerHTML = "";

    book.ready.then(() => {
      if (book.spine) {
        const rendition_ = book.renderTo("viewer", {
          flow: "paginated",
          width: "100%",
          height: "100%",
          resizeOnOrientationChange: true,
          spread: "auto",
        });

        rendition_.themes.default({
          "::selection": {
            background: "rgba(255,255,0, 0.3)",
          },
          ".epubjs-hl": {
            "fill-opacity": "0.3",
            "mix-blend-mode": "multiply",
          },
        });

        setRendition(rendition_);
        rendition_.display();

        onScrollToHighlightReady((position: EpubAnnotation["position"]) => {
          rendition_.display(position.cfiRange);
        });
      }
    });
  }, [viewerRef, book, onScrollToHighlightReady]);

  useEffect(() => {
    if (!rendition) return;
    rendition.on("selected", onSelectionChanged);
    rendition.on("mouseup", handleMouseUp);
    rendition.on("mousedown", handleMouseDown);
    rendition.on("keyup", handleKeyUp);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      rendition.off("selected", onSelectionChanged);
      rendition.off("mouseup", handleMouseUp);
      rendition.off("mousedown", handleMouseDown);
      rendition.off("keyup", handleKeyUp);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [
    rendition,
    onSelectionChanged,
    handleMouseUp,
    handleMouseDown,
    handleKeyUp,
  ]);

  const clearRenditionAnnotations = useCallback(
    (rendition: Rendition, annotations: Array<EpubAnnotation>) => {
      if (!rendition) return;
      annotations.forEach(removeHighlightInDoc);

      // @ts-ignore
      rendition.annotations._annotationsBySectionIndex = {};
    },
    [removeHighlightInDoc]
  );

  useEffect(() => {
    if (!rendition) return;
    clearRenditionAnnotations(rendition, annotations);
    annotations.forEach(createHighlightInDoc);

    return () => {
      if (!rendition) return;
      clearRenditionAnnotations(rendition, annotations);
    };
  }, [annotations, clearRenditionAnnotations, createHighlightInDoc, rendition]);

  return (
    <div className="h-full w-full flex flex-col relative">
      <div id="viewer" className="h-full w-full my-1" ref={viewerRef}></div>
      <div className="flex-initial">
        <div className="flex flex-grow justify-around mb-2 gap-x-2">
          <button
            type="button"
            className="w-60 flex-shrink bg-gray-100 hover:bg-gray-200 font-bold rounded flex justify-center"
            onClick={() => navigateRendition(-1)}
          >
            <UilAngleLeftB className="text-gray-400" />
          </button>
          <button
            type="button"
            className="w-60 flex-shrink bg-gray-100 hover:bg-gray-200 font-bold rounded flex justify-center"
            onClick={() => navigateRendition(1)}
          >
            <UilAngleRightB className="text-gray-400" />
          </button>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: hTooltipPos?.x!,
          top: hTooltipPos?.y!,
          visibility: showHTooltip ? "visible" : "hidden",
        }}
        ref={hTooltipRef}
      >
        <HighlightTooltip
          currentHighlightColor={undefined}
          highlightColors={highlightColors}
          onColorClick={handleHighlightColorClick}
        />
      </div>
    </div>
  );
}

export const sortEpubAnnotationsByPositition = (
  ann1: EpubAnnotation,
  ann2: EpubAnnotation
) => {
  return new EpubCFI().compare(ann1.position.cfiRange, ann2.position.cfiRange);
};
