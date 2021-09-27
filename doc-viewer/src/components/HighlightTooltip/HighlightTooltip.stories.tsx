import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";

import { HighlightTooltip } from ".";

export default {
  title: "HIghlighting/HighlightTooltip",
  component: HighlightTooltip,
} as ComponentMeta<typeof HighlightTooltip>;

const Template: ComponentStory<typeof HighlightTooltip> = (args) => (
  <HighlightTooltip {...args} />
);

export const Default = Template.bind({});
Default.args = {
  onUpdate: () => {},
  onOpen: () => {},
  onConfirm: () => {},
};
