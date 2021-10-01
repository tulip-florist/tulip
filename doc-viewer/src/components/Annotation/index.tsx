import { ChangeEvent, ReactElement } from "react";
import { UilEllipsisH } from "@iconscout/react-unicons";
import AutoTextArea from "../AutoTextArea";
interface Props {
  text: string;
  note: string;
  location: string;
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
}

export default function Annotation({
  text,
  note,
  location,
  onChange,
}: Props): ReactElement {
  return (
    <>
      <div className="container mx-auto border-2 border-gray-200 rounded p-5">
        <div className="grid grid-cols-12 grid-rows-2 gap-x-2 gap-y-2 grid-rows-none grid-cols-none">
          <div className="row-start-1 col-span-11 border-l-4 border-yellow-300 pl-3">
            <blockquote>{text}</blockquote>
          </div>
          <div className="col-start-12">
            <button
              type="button"
              className="bg-gray-100 hover:bg-gray-200 font-bold rounded"
            >
              <UilEllipsisH className="text-gray-400" />
            </button>
          </div>
          <div className="row-start-2 col-span-11 border-l-4 border-transparent pl-1 py-1">
            <AutoTextArea
              placeholder="Add note..."
              value={note}
              onChange={onChange}
            />
          </div>
        </div>
      </div>
    </>
  );
}
