import { useState, ReactElement, useEffect, useRef, useCallback } from "react";
import ePub, { Book, Contents, Rendition } from "epubjs";
import {
  Color,
  EpubAnnotation,
  handleCreateAnnotationSignature,
  Highlight,
} from "../../types/types";
import { HighlightTooltip } from "../HighlightTooltip";

interface Props {
  file: File;
  highlightColors: Array<Color>;
  annotations: Array<EpubAnnotation>;
  handleCreateAnnotation: handleCreateAnnotationSignature;
}

export default function EpubReader({
  file,
  highlightColors,
  annotations,
  handleCreateAnnotation,
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

  const highlightDocText = useCallback(
    (cfiRange: string, color: string) => {
      rendition?.annotations.highlight(
        cfiRange,
        undefined,
        (e: any) => {
          // TODO: scroll to annotation in annotation-side panel
          console.log("highlight clicked", e.target);
        },
        undefined,
        { fill: color }
      );
    },
    [rendition]
  );

  const removeDocTextHighlight = useCallback(
    (cifRange: string) => {
      rendition?.annotations.remove(cifRange, "highlight");
    },
    [rendition]
  );

  const handleHighlightColorClick = (color: string) => {
    setShowHTooltip(false);
    handleCreateAnnotation({
      position: { cfiRange: currSelection.current?.cfiRange! },
      color,
      highlight: { text: currSelection.current?.highlight.text },
    });

    currSelection.current?.contents.window.getSelection()?.removeAllRanges();
    currSelection.current = undefined;
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
      // wait to make sure that currSelection got set by selectionChanged
      setTimeout(() => {
        if (!viewerRef.current || !currSelection.current) return;

        const epubContainer = viewerRef.current.children[0];
        setHTooltipPos({
          x: event.pageX - epubContainer.scrollLeft,
          y: event.pageY - epubContainer.scrollTop,
        });
        setShowHTooltip(true);
      }, 350);
    },
    [currSelection]
  );

  const onMouseDownHandler = useCallback(() => {
    currSelection.current = undefined;
    setShowHTooltip(false);
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
          manager: "continuous",
          flow: "scrolled",
          width: "100%",
          height: "100%",
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
      }
    });
  }, [viewerRef, book]);

  useEffect(() => {
    if (!rendition) return;
    rendition.on("selected", onSelectionChanged);
    rendition.on("mouseup", onMouseUpHandler);
    rendition.on("mousedown", onMouseDownHandler);

    return () => {
      rendition.off("selected", onSelectionChanged);
      rendition.off("mouseup", onMouseUpHandler);
      rendition.off("mousedown", onMouseDownHandler);
    };
  }, [rendition, onSelectionChanged, onMouseUpHandler, onMouseDownHandler]);

  useEffect(() => {
    annotations.forEach((annotation) => {
      highlightDocText(annotation.position.cfiRange, annotation.color);
    });

    return () => {
      annotations.forEach((annotation) => {
        removeDocTextHighlight(annotation.position.cfiRange);
      });
    };
  }, [annotations, removeDocTextHighlight, highlightDocText]);

  return (
    <>
      <div id="viewer" className="w-full h-full" ref={viewerRef}></div>
      {showHTooltip && (
        <div
          style={{
            position: "absolute",
            left: hTooltipPos?.x!,
            top: hTooltipPos?.y!,
          }}
        >
          <HighlightTooltip
            currentHighlightColor={undefined}
            highlightColors={highlightColors.map((it) => it.hex)}
            handleHighlightColorClick={handleHighlightColorClick}
          />
        </div>
      )}
    </>
  );
}
