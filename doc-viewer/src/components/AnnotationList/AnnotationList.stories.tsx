import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";

import { AnnotationList } from ".";

export default {
  title: "AnnotationList",
  component: AnnotationList,
} as ComponentMeta<typeof AnnotationList>;

const Template: ComponentStory<typeof AnnotationList> = (args) => (
  <AnnotationList {...args} />
);

export const Default = Template.bind({});
Default.args = {};
