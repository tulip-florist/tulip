import { useMemo } from "react";

import {
  PdfLoader,
  PdfHighlighter,
  Popup,
  ScaledPosition,
} from "react-pdf-highlighter";

import type { IHighlight } from "react-pdf-highlighter";

import { Spinner } from "./Spinner";

import "../../style/App.css";
import { HighlightTooltip } from "../HighlightTooltip";
import PdfHighlight from "../PdfHighlight";
import { PdfAnnotation, PdfAnnotationNoId } from "./types";

interface PdfAnnotationExtendsIHighligh extends IHighlight {
  color: string;
}

interface Props {
  file: File;
  annotations: Array<PdfAnnotation>;
  highlightColors: Array<string>;
  onCreateAnnotation: (newAnnotation: PdfAnnotationNoId) => void;
  onScrollToHighlightReady: (
    scrollToFn: (position: PdfAnnotation["position"]) => void
  ) => void;
  onHighlightClick?: (annotation: PdfAnnotation) => void;
}

const HighlightPopup = ({
  comment,
}: {
  comment: { text: string; emoji: string };
}) =>
  comment.text ? (
    <div className="Highlight__popup">
      {comment.emoji} {comment.text}
    </div>
  ) : null;

const pdfAnnotationToPdfAnnotationExtendsIHighlight = (
  pdfAnnotation: PdfAnnotation
): PdfAnnotationExtendsIHighligh => {
  return {
    id: pdfAnnotation.id,
    color: pdfAnnotation.color,
    position: pdfAnnotation.position as ScaledPosition,
    comment: { text: pdfAnnotation.note || "", emoji: "" },
    content: { text: pdfAnnotation.highlight },
  };
};

const pdfAnnotationExtendsIHighlightToPdfAnnotation = (
  pdfAnnotationExtendsIHighlight: PdfAnnotationExtendsIHighligh
): PdfAnnotation => {
  return {
    id: pdfAnnotationExtendsIHighlight.id,
    color: pdfAnnotationExtendsIHighlight.color,
    position: pdfAnnotationExtendsIHighlight.position as ScaledPosition,
    note: pdfAnnotationExtendsIHighlight.comment.text,
    highlight: pdfAnnotationExtendsIHighlight.content.text || "",
  };
};

const PdfViewer = ({
  annotations,
  file,
  highlightColors,
  onCreateAnnotation: handleCreateAnnotation,
  onScrollToHighlightReady,
  onHighlightClick: handleHighlightClick,
}: Props) => {
  const url = useMemo(() => {
    return URL.createObjectURL(file);
  }, [file]);

  const highlights: Array<PdfAnnotationExtendsIHighligh> = annotations.map(
    pdfAnnotationToPdfAnnotationExtendsIHighlight
  );

  return (
    <div className="App" style={{ display: "flex", height: "100vh" }}>
      <PdfLoader url={url} beforeLoad={<Spinner />}>
        {(pdfDocument) => {
          return (
            <PdfHighlighter<PdfAnnotationExtendsIHighligh>
              highlights={highlights}
              pdfDocument={pdfDocument}
              enableAreaSelection={(event) => event.altKey}
              onScrollChange={() => {}}
              scrollRef={(scrollTo) => {
                onScrollToHighlightReady(
                  () => (position: PdfAnnotation["position"]) => {
                    const fakeAnnotation: IHighlight = {
                      comment: { emoji: "", text: "" },
                      content: { image: "", text: "" },
                      id: "",
                      position: position,
                    };
                    scrollTo(fakeAnnotation);
                  }
                );
              }}
              onSelectionFinished={(
                position,
                content,
                hideTipAndSelection,
                transformSelection
              ) => {
                transformSelection();

                return (
                  <HighlightTooltip
                    currentHighlightColor={undefined}
                    highlightColors={highlightColors}
                    onColorClick={(color: string) => {
                      if (!content.text) return;
                      handleCreateAnnotation({
                        position,
                        color,
                        highlight: content.text,
                      });
                    }}
                  />
                );
              }}
              highlightTransform={(
                highlight,
                index,
                setTip,
                hideTip,
                viewportToScaled,
                screenshot,
                isScrolledTo
              ) => {
                const component = (
                  <PdfHighlight
                    isScrolledTo={isScrolledTo}
                    position={highlight.position}
                    color={highlight.color}
                    note={highlight?.comment?.text}
                    onClick={
                      handleHighlightClick
                        ? () =>
                            handleHighlightClick(
                              pdfAnnotationExtendsIHighlightToPdfAnnotation(
                                highlight
                              )
                            )
                        : undefined
                    }
                  />
                );

                return (
                  <Popup
                    popupContent={<HighlightPopup {...highlight} />}
                    onMouseOver={(popupContent) =>
                      setTip(highlight, (highlight) => popupContent)
                    }
                    onMouseOut={hideTip}
                    key={index}
                    children={component}
                  />
                );
              }}
            />
          );
        }}
      </PdfLoader>
    </div>
  );
};

export default PdfViewer;
