export default "abc";
// import { useState } from "react";
// import { ComponentMeta, ComponentStory } from "@storybook/react";

// import Annotation from ".";
// import { Annotation as AnnotationType } from "../../types/types";
// import { testAnnotation, emptyTestAnnotation } from "./test-annotation";

// export default {
//   title: "Highlighting/Annotation",
//   component: Annotation,
// } as ComponentMeta<typeof Annotation>;

// const Template: ComponentStory<typeof Annotation> = (args: {
//   annotation: AnnotationType;
// }) => {
//   const [note, setNote] = useState(args.annotation.note);

//   return (
//     <Annotation
//       annotation={{ ...args.annotation, note }}
//       onNoteChange={(annotationId, note) => {
//         setNote(note);
//       }}
//       onDelete={(annotationId) => {}}
//       onClick={() => console.log("click")}
//     />
//   );
// };

// export const Default = Template.bind({});
// Default.args = {
//   annotation: emptyTestAnnotation,
// };

// export const Filled = Template.bind({});
// Filled.args = {
//   annotation: testAnnotation,
// };
