import { ChangeEvent, ReactElement } from "react";
import { UilEllipsisH } from "@iconscout/react-unicons";
import AutoTextArea from "../AutoTextArea";
import { Annotation as AnnotationType } from "../../types/types";
interface Props {
  annotation: AnnotationType;
  onNoteChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
}

export default function Annotation({
  annotation,
  onNoteChange,
}: Props): ReactElement {
  return (
    <>
      <div className="border-2 border-gray-200 rounded p-5">
        <div className="grid grid-cols-12 grid-rows-2 gap-x-2 gap-y-2 grid-rows-none grid-cols-none">
          <div className="row-start-1 col-span-11 border-l-4 border-yellow-300 pl-3 flex flex-col justify-center">
            <blockquote>{annotation.content}</blockquote>
          </div>
          <div className="col-start-12 justify-self-end">
            <button
              type="button"
              className="bg-gray-100 hover:bg-gray-200 font-bold rounded"
            >
              <UilEllipsisH className="text-gray-400" />
            </button>
          </div>
          <div className="row-start-2 col-span-11 border-l-4 border-transparent pl-1 pt-1">
            <AutoTextArea
              placeholder="Add note..."
              value={annotation.note}
              onChange={onNoteChange}
            />
          </div>
        </div>
      </div>
    </>
  );
}
