import React, { Component } from "react";

import {
  PdfLoader,
  PdfHighlighter,
  Popup,
  AreaHighlight,
} from "react-pdf-highlighter";

import type { IHighlight, NewHighlight } from "react-pdf-highlighter";

import { Spinner } from "./Spinner";

import "../../style/App.css";
import {
  Annotation,
  AnnotationNoId,
  Color,
  handleCreateAnnotationType,
} from "../../types/types";
import { HighlightTooltip } from "../HighlightTooltip";
import PdfHighlight from "../PdfHighlight";

export interface PdfAnnotationNoId extends NewHighlight {
  color: string;
}

export interface PdfAnnotation extends PdfAnnotationNoId, IHighlight {}

interface Props {
  file: File;
  handleCreateAnnotation: handleCreateAnnotationType;
  highlightColors: Array<Color>;
  annotations: Array<Annotation>;
}

const getNextId = () => String(Math.random()).slice(2);

const parseIdFromHash = () =>
  document.location.hash.slice("#highlight-".length);

const resetHash = () => {
  document.location.hash = "";
};

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

const PRIMARY_PDF_URL = "https://arxiv.org/pdf/1708.08021.pdf";
const SECONDARY_PDF_URL = "https://arxiv.org/pdf/1604.02480.pdf";

const searchParams = new URLSearchParams(document.location.search);

const initialUrl = searchParams.get("url") || PRIMARY_PDF_URL;

function annotationToPdfAnnotation(annotation: Annotation): PdfAnnotation {
  return {
    id: annotation.id,
    color: annotation.color,
    position: annotation.position,
    comment: { text: annotation.note || "", emoji: "" },
    content: { text: annotation.highlight.text },
  };
}

function pdfAnnotationToAnnotation(pdfAnnotation: PdfAnnotation): Annotation {
  return {
    id: pdfAnnotation.id,
    color: pdfAnnotation.color,
    highlight: pdfAnnotation.content,
    position: pdfAnnotation.position,
    note: pdfAnnotation.comment.text,
  };
}

class PdfViewer extends Component<Props> {
  scrollViewerTo = (highlight: any) => {};

  scrollToHighlightFromHash = () => {
    const highlight = this.getHighlightById(parseIdFromHash());

    if (highlight) {
      this.scrollViewerTo(highlight);
    }
  };

  componentDidMount() {
    window.addEventListener(
      "hashchange",
      this.scrollToHighlightFromHash,
      false
    );
  }

  getHighlightById(id: string) {
    const highlights = this.props.annotations.map(annotationToPdfAnnotation);

    return highlights.find((highlight) => highlight.id === id);
  }

  // updateHighlight(highlightId: string, position: Object, content: Object) {
  //   console.log("Updating highlight", highlightId, position, content);

  //   this.setState({
  //     highlights: this.state.highlights.map((h) => {
  //       const {
  //         id,
  //         position: originalPosition,
  //         content: originalContent,
  //         ...rest
  //       } = h;
  //       return id === highlightId
  //         ? {
  //             id,
  //             position: { ...originalPosition, ...position },
  //             content: { ...originalContent, ...content },
  //             ...rest,
  //           }
  //         : h;
  //     }),
  //   });
  // }

  render() {
    const { file, annotations } = this.props;
    const url = URL.createObjectURL(file);

    const highlights: Array<PdfAnnotation> = annotations.map(
      annotationToPdfAnnotation
    );

    return (
      <div className="App" style={{ display: "flex", height: "100vh" }}>
        <PdfLoader url={url} beforeLoad={<Spinner />}>
          {(pdfDocument) => (
            <PdfHighlighter<PdfAnnotation>
              highlights={highlights}
              pdfDocument={pdfDocument}
              enableAreaSelection={(event) => event.altKey}
              onScrollChange={resetHash}
              // pdfScaleValue="page-width"
              scrollRef={(scrollTo) => {
                this.scrollViewerTo = scrollTo;

                this.scrollToHighlightFromHash();
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
                    highlightColors={this.props.highlightColors.map(
                      (it) => it.hex
                    )}
                    handleHighlightColorClick={(color, active) => {
                      console.log("handleHighlightColorClick");
                      console.log(color, active);
                      this.props.handleCreateAnnotation({
                        position,
                        color,
                        highlight: content,
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
                const isTextHighlight = !Boolean(
                  highlight.content && highlight.content.image
                );

                const component = isTextHighlight ? (
                  <PdfHighlight
                    isScrolledTo={isScrolledTo}
                    position={highlight.position}
                    color={highlight.color}
                    note={highlight?.comment?.text}
                  />
                ) : (
                  <AreaHighlight
                    isScrolledTo={isScrolledTo}
                    highlight={highlight}
                    onChange={(boundingRect) => {
                      // this.updateHighlight(
                      //   highlight.id,
                      //   { boundingRect: viewportToScaled(boundingRect) },
                      //   { image: screenshot(boundingRect) }
                      // );
                      console.log("area highlight update not implemented yet");
                    }}
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
          )}
        </PdfLoader>
      </div>
    );
  }
}

export default PdfViewer;
