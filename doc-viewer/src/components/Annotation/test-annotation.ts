const testPosition = {
  boundingRect: {
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
    width: 0,
    height: 0,
  },
  rects: [
    {
      x1: 0,
      y1: 0,
      x2: 0,
      y2: 0,
      width: 0,
      height: 0,
    },
  ],
  pageNumber: 0,
};

export const testAnnotation = {
  id: "1a",
  highlight: {
    text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Cumque explicabo est mollitia incidunt minus ullam officiis recusandae ut voluptates dolores necessitatibus hic neque molestiae ea error, id magni ipsam, cupiditate ex, labore ab!",
  },
  note: "That is very interesting. I saw a mention of it in book xyz.",
  color: "",
  position: testPosition,
};

export const emptyTestAnnotation = {
  id: "1a",
  highlight: {text: ""},
  note: "",
  color: "",
  position: testPosition,
};
