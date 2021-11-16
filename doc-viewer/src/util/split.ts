import { SplitProps } from "react-split";

const splitPaneConfig = {
  ratioLeft: 75, // "ratioRight" = 100 - ratioLeft
  gutterStrokeWidth: 2, // pixels
  gutterPadding: 12, // pixels
  minAnnoPanelWidth: 100, // pixels
  minDocPanelWidth: 250, // pixels
};

export const defaultSplitPaneProps: SplitProps = {
  sizes: [splitPaneConfig.ratioLeft, 100 - splitPaneConfig.ratioLeft],
  minSize: [
    splitPaneConfig.minDocPanelWidth,
    splitPaneConfig.minAnnoPanelWidth,
  ],
  expandToMin: true,
  gutterStyle: (dimension: any, gutterSize: any, index: any) => {
    const gutterWidth =
      splitPaneConfig.gutterPadding * 2 + splitPaneConfig.gutterStrokeWidth;
    return {
      height: "100%",
      width: `${gutterWidth}px`,
      borderLeft: `${splitPaneConfig.gutterPadding}px solid white`,
      borderRight: `${splitPaneConfig.gutterPadding}px solid white`,
      backgroundColor: "#d2d2d2",
    };
  },
  dragInterval: 1,
  direction: "horizontal"
};
