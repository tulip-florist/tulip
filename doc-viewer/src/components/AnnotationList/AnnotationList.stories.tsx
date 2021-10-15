import { useState } from "react";
import { ComponentMeta, ComponentStory } from "@storybook/react";

import AnnotationList from ".";
import { Annotation } from "../../types/types";
import {
  emptyTestAnnotation,
  testAnnotation,
} from "../Annotation/test-annotation";

export default {
  title: "Highlighting/AnnotationList",
  component: AnnotationList,
} as ComponentMeta<typeof AnnotationList>;

const Template: ComponentStory<typeof AnnotationList> = (args: {
  annotations: Array<Annotation>;
}) => {
  const [annotations, setAnnotations] = useState(args.annotations);

  return (
    <AnnotationList annotations={annotations} setAnnotations={setAnnotations} />
  );
};

export const Default = Template.bind({});

Default.args = {
  annotations: [
    { ...testAnnotation, id: "1a" },
    { ...emptyTestAnnotation, id: "2a" },
    { ...testAnnotation, id: "3a" },
    { ...testAnnotation, id: "4a" },
  ],
};
