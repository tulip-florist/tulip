import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";

import { HighlightTooltip } from ".";

export default {
  title: "HighlightTooltip",
  component: HighlightTooltip,
  parameters: {
    backgrounds: {
      default: "gray",
    },
  },
} as ComponentMeta<typeof HighlightTooltip>;

const Template: ComponentStory<typeof HighlightTooltip> = (args) => (
  <HighlightTooltip {...args} />
);

export const Default = Template.bind({});
Default.args = {
  highlightColors: ["#F9D755", "#78D45F", "#6FB7F7", "#EE7A99", "#A78FEB"],
  currentHighlightColor: "#A78FEB",
};
