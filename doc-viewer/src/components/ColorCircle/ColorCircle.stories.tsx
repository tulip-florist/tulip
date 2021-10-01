import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";

import { ColorCircle } from ".";

export default {
  title: "ColorCircle",
  component: ColorCircle,
} as ComponentMeta<typeof ColorCircle>;

const Template: ComponentStory<typeof ColorCircle> = (args) => (
  <ColorCircle {...args} />
);

export const Default = Template.bind({});
Default.args = {
  active: true,
  color: "#FEFF9C",
};
