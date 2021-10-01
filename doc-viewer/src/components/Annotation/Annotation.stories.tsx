import { useState } from "react";
import { ComponentMeta } from "@storybook/react";

import Annotation from ".";

export default {
  title: "Highlighting/Annotation",
  component: Annotation,
} as ComponentMeta<typeof Annotation>;

export const Test = (args: any) => {
  const [note, setNote] = useState(args.note);

  return (
    <Annotation
      text={args.text}
      note={note}
      location={args.location}
      onChange={(event) => {
        setNote(event.target.value);
      }}
    />
  );
};

Test.args = {
  text:
    "Lorem ipsum dolor sit amet consectetur adipisicing elit. Cumque explicabo est mollitia incidunt minus ullam officiis recusandae ut voluptates dolores necessitatibus hic neque molestiae ea error, id magni ipsam, cupiditate ex, labore ab!",
  note: "That is very interesting. I saw a mention of it in book xyz.",
  location: "",
};
