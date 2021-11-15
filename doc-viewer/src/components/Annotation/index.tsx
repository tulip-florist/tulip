import { ChangeEvent, ReactElement } from "react";
import useDetectClickOut from "../../hooks/useDetectClickOut";
import { UilEllipsisH } from "@iconscout/react-unicons";
import AutoTextArea from "../AutoTextArea";

interface Props {
  highlight: string;
  note?: string;
  color: string;
  onNoteChange: (note: string) => void;
  onDelete: () => void;
  onClick: () => void;
  containerRef?: React.RefObject<HTMLDivElement>;
  inputRef?: React.RefObject<HTMLTextAreaElement>;
}

export default function Annotation({
  highlight,
  note,
  color,
  onNoteChange,
  onDelete,
  onClick,
  containerRef,
  inputRef,
}: Props): ReactElement {
  const { show, nodeRef, triggerRef } = useDetectClickOut(false);

  return (
    <div ref={containerRef} className="border-2 border-gray-200 rounded p-5">
      <div className="grid grid-cols-12 grid-rows-2 gap-x-2 gap-y-2 grid-rows-none grid-cols-none">
        <div
          className="row-start-1 col-span-11 border-l-4 border-yellow-300 pl-3 flex flex-col justify-center"
          style={{ borderColor: color }}
        >
          <blockquote className="cursor-pointer select-none" onClick={onClick}>
            {highlight}
          </blockquote>
        </div>
        <div className="col-start-12 relative justify-self-end">
          <div ref={triggerRef}>
            <button
              type="button"
              className="bg-gray-100 hover:bg-gray-200 font-bold rounded"
            >
              <UilEllipsisH className="text-gray-400" />
            </button>
          </div>
          {show && (
            <div
              className="origin-top-right right-0 w-max absolute rounded-md z-10 shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
              aria-orientation="vertical"
              ref={nodeRef}
            >
              <button
                type="button"
                className="text-gray-700 block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 select-none"
                onClick={onDelete}
              >
                Delete
              </button>
            </div>
          )}
        </div>
        <div className="row-start-2 col-span-11 border-l-4 border-transparent pl-1 pt-1 select-none">
          <AutoTextArea
            placeholder="Add note..."
            value={note}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              onNoteChange(e.target.value)
            }
            ref={inputRef}
          />
        </div>
      </div>
    </div>
  );
}
