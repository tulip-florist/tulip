import { useState, ReactElement, useEffect, useRef, useCallback } from "react";
import ePub, { Book, Contents, Rendition } from "epubjs";
import {
  Color,
  Annotation,
  EpubAnnotation,
  handleCreateAnnotationSignature,
  Highlight,
} from "../../types/types";
import { UilAngleLeftB, UilAngleRightB } from "@iconscout/react-unicons";
import { HighlightTooltip } from "../HighlightTooltip";

interface Props {
  file: File;
  highlightColors: Array<Color>;
  annotations: Array<EpubAnnotation>;
  handleCreateAnnotation: handleCreateAnnotationSignature;
  handleClickOnHighlight?: (...args: any[]) => void;
  onScrollToHighlightReady: (
    fn: (position: Annotation["position"]) => void
  ) => void;
}

export default function EpubReader({
  file,
  highlightColors,
  annotations,
  handleCreateAnnotation,
  handleClickOnHighlight,
  onScrollToHighlightReady,
}: Props): ReactElement {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [book, setBook] = useState<Book>();
  const [rendition, setRendition] = useState<Rendition | null>(null);
  const [showHTooltip, setShowHTooltip] = useState<boolean>(false);
  const [hTooltipPos, setHTooltipPos] = useState<{
    x: number;
    y: number;
  }>();
  const currSelection = useRef<{
    cfiRange: string;
    highlight: Highlight;
    contents: Contents;
  }>();
  const hTooltipRef = useRef<HTMLDivElement>(null);

  const calulateHTooltipPosition = (mouseX: number, mouseY: number) => {
    const tooltip = hTooltipRef.current;
    const viewer = viewerRef.current;

    if (!viewer || !tooltip) return;

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
    [rendition, showHTooltip]
  );

  const onKeyUpHandler = useCallback(
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
    (annotationId: EpubAnnotation["id"], cfiRange: string, color: string) => {
      rendition?.annotations.highlight(
        cfiRange,
        undefined,
        () => {
          if (handleClickOnHighlight) handleClickOnHighlight(annotationId);
        },
        undefined,
        { fill: color }
      );
    },
    [rendition, handleClickOnHighlight]
  );

  const removeHighlightInDoc = useCallback(
    (cifRange: string) => {
      rendition?.annotations.remove(cifRange, "highlight");
    },
    [rendition]
  );

  const handleHighlightColorClick = (color: string) => {
    handleCreateAnnotation({
      position: { cfiRange: currSelection.current?.cfiRange! },
      color,
      highlight: { text: currSelection.current?.highlight.text },
    });

    clearCurrSelection();
  };

  const onSelectionChanged = useCallback(
    (cfiRange: string, contents: Contents) => {
      if (!book) return;
      book.getRange(cfiRange).then((range) => {
        currSelection.current = {
          cfiRange,
          highlight: {
            text: range.toString(),
          },
          contents,
        };
      });
    },
    [book]
  );

  const onMouseUpHandler = useCallback(
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

  const onMouseDownHandler = useCallback(() => {
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

        onScrollToHighlightReady((position: Annotation["position"]) => {
          rendition_.display((position as EpubAnnotation["position"]).cfiRange);
        });
      }
    });
  }, [viewerRef, book, onScrollToHighlightReady]);

  useEffect(() => {
    if (!rendition) return;
    rendition.on("selected", onSelectionChanged);
    rendition.on("mouseup", onMouseUpHandler);
    rendition.on("mousedown", onMouseDownHandler);
    rendition.on("keyup", onKeyUpHandler);
    window.addEventListener("keyup", onKeyUpHandler);

    return () => {
      rendition.off("selected", onSelectionChanged);
      rendition.off("mouseup", onMouseUpHandler);
      rendition.off("mousedown", onMouseDownHandler);
      rendition.off("keyup", onKeyUpHandler);
      window.removeEventListener("keyup", onKeyUpHandler);
    };
  }, [
    rendition,
    onSelectionChanged,
    onMouseUpHandler,
    onMouseDownHandler,
    onKeyUpHandler,
  ]);

  useEffect(() => {
    annotations.forEach((annotation) => {
      createHighlightInDoc(
        annotation.id,
        annotation.position.cfiRange,
        annotation.color
      );
    });

    return () => {
      annotations.forEach((annotation) => {
        removeHighlightInDoc(annotation.position.cfiRange);
      });
    };
  }, [annotations, removeHighlightInDoc, createHighlightInDoc]);

  return (
    <>
      <div className="h-full flex flex-col">
        <div id="viewer" className="w-full h-full" ref={viewerRef}></div>
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
          highlightColors={highlightColors.map((it) => it.hex)}
          handleHighlightColorClick={handleHighlightColorClick}
        />
      </div>
    </>
  );
}
