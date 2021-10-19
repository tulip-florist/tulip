// https://javascript.plainenglish.io/detect-a-click-outside-of-a-react-component-with-a-reusable-hook-and-useref-a0c282171c3f
import { useEffect, useRef, useState } from "react";
export default function useDetectClickOut(initState: boolean) {
  const triggerRef = useRef<HTMLInputElement>(null); // optional
  const nodeRef = useRef<HTMLInputElement>(null); // required

  const [show, setShow] = useState<boolean>(initState);
  const handleClickOutside = (event: MouseEvent) => {
    //if click is on trigger element, toggle modal
    if (
      triggerRef.current &&
      triggerRef.current.contains(event.target as Node)
    ) {
      return setShow(!show);
    }

    //if modal is open and click is outside modal, close it
    if (nodeRef.current && !nodeRef.current.contains(event.target as Node)) {
      return setShow(false);
    }
  };
  useEffect(() => {
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  });
  return {
    triggerRef,
    nodeRef,
    show,
    setShow,
  };
}
