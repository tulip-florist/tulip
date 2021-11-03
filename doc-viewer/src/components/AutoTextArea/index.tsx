import React, {
  useRef,
  useState,
  useEffect,
  TextareaHTMLAttributes,
  useImperativeHandle,
} from "react";

export const AutoTextArea = React.forwardRef(
  (props: TextareaHTMLAttributes<HTMLTextAreaElement>, forwardedRef) => {
    const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
    useImperativeHandle(forwardedRef, () => textAreaRef.current, [textAreaRef]);

    const [text, setText] = useState<string>("");
    const [textAreaHeight, setTextAreaHeight] = useState<string>("auto");
    const [parentHeight, setParentHeight] = useState<string>("auto");

    const textAreaBorder = 4;

    useEffect(() => {
      setParentHeight(`${textAreaRef.current!.scrollHeight}px`);
      setTextAreaHeight(
        `${textAreaRef.current!.scrollHeight + textAreaBorder}px`
      );
    }, [text]);

    useEffect(() => {
      // resize on window size change
      const resizeObserver = new ResizeObserver(() => {
        setTextAreaHeight("auto");
        if (textAreaRef.current) {
          setParentHeight(`${textAreaRef.current!.scrollHeight}px`);
          setTextAreaHeight(
            `${textAreaRef.current!.scrollHeight + textAreaBorder}px`
          );
        }
      });
      if (textAreaRef.current) {
        resizeObserver.observe(textAreaRef.current);
      }
      return () => {
        resizeObserver.disconnect();
      };
    }, [textAreaRef]);

    const onChangeHandler = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setTextAreaHeight("auto");
      setParentHeight(`${textAreaRef.current!.scrollHeight}px`);
      setText(event.target.value);

      if (props.onChange) {
        props.onChange(event);
      }
    };

    return (
      <div
        style={{
          minHeight: parentHeight,
        }}
      >
        <textarea
          {...props}
          ref={textAreaRef}
          rows={1}
          style={{
            height: textAreaHeight,
            resize: "none",
          }}
          className="appearance-none border-2 border-transparent rounded w-full py-2 px-2 focus:outline-none focus:border-gray-200"
          onChange={onChangeHandler}
        />
      </div>
    );
  }
);

export default AutoTextArea;
