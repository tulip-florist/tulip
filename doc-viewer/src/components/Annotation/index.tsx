import { ChangeEvent, ReactElement } from "react";
import useDetectClickOut from "../../hooks/useDetectClickOut";
import { UilEllipsisH } from "@iconscout/react-unicons";
import AutoTextArea from "../AutoTextArea";
import {
  Annotation as AnnotationType,
  handleAnnotationNoteUpateSignature,
} from "../../types/types";
interface Props {
  annotation: AnnotationType;
  onNoteChange: handleAnnotationNoteUpateSignature;
  onDelete: (annotationId: AnnotationType["id"]) => void;
  onClick: (annotation: AnnotationType) => void;
}

export default function Annotation({
  annotation,
  onNoteChange,
  onDelete,
  onClick,
}: Props): ReactElement {
  const { show, nodeRef, triggerRef } = useDetectClickOut(false);

  const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onNoteChange(annotation.id, event.target.value);
  };

  return (
    <>
      <div className="border-2 border-gray-200 rounded p-5">
        <div className="grid grid-cols-12 grid-rows-2 gap-x-2 gap-y-2 grid-rows-none grid-cols-none">
          <div
            className="row-start-1 col-span-11 border-l-4 border-yellow-300 pl-3 flex flex-col justify-center"
            style={{ borderColor: annotation.color }}
          >
            <blockquote
              className="cursor-pointer"
              onClick={() => onClick(annotation)}
            >
              {annotation.highlight.text}
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
                  onClick={() => onDelete(annotation.id)}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
          <div className="row-start-2 col-span-11 border-l-4 border-transparent pl-1 pt-1 select-none">
            <AutoTextArea
              placeholder="Add note..."
              value={annotation.note}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </div>
    </>
  );
}
