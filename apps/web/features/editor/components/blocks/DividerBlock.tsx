import type { ReactElement } from "react";
import type { Block } from "@workspace/types";

export interface DividerBlockProps {
  block: Block;
}

export const DividerBlock = ({ block }: DividerBlockProps): ReactElement => {
  return (
    <div data-block-id={block.id} className="py-2 my-1 cursor-default select-none">
      <hr className="border-t border-gray-200" />
    </div>
  );
};
