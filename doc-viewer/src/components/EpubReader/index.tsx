import { useState, ReactElement, useEffect, useRef, useCallback } from "react";
import ePub, { Book, Rendition } from "epubjs";
import {
  Color,
  handleCreateAnnotationSignature,
  Highlight,
} from "../../types/types";
import { HighlightTooltip } from "../HighlightTooltip";

interface Props {
  file: File;
  highlightColors: Array<Color>;
  handleCreateAnnotation: handleCreateAnnotationSignature;
}

export default function EpubReader({
  file,
  highlightColors,
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
  }>();

  const handleHighlightColorClick = (color: string) => {
    setShowHTooltip(false);
    handleCreateAnnotation({
      position: { cfiRange: currSelection.current?.cfiRange! },
      color,
      highlight: { text: currSelection.current?.highlight.text },
    });
    currSelection.current = undefined;
  };

  const onSelectionChanged = useCallback(
    (cfiRange: string) => {
      if (!book) return;
      book.getRange(cfiRange).then((range) => {
        currSelection.current = {
          cfiRange,
          highlight: {
            text: range.toString(),
          },
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
