import { useRef, useState } from "react";
import { FaHashtag } from "react-icons/fa";
import { Sheet, type SheetRef } from "react-modal-sheet";
import ChipInput from "./ChipInput";

interface TagEditorProps {
  isShowing: boolean;
  onClose: () => void;
  initialTags?: string[];
  onTagsChange?: (tags: string[]) => void;
}

const TagEditorComponent: React.FC<TagEditorProps> = ({
  isShowing,
  onClose,
  initialTags = [],
  onTagsChange,
}) => {
  const ref = useRef<SheetRef>(null);
  const [tags, setTags] = useState<string[]>(initialTags);

  const handleTagsChange = (newTags: string[]) => {
    setTags(newTags);
    onTagsChange?.(newTags);
  };

  const handleSave = () => {
    onTagsChange?.(tags);
    onClose();
  };

    const handleBackdropTap = () => {
        console.log("Backdrop tapped");
        onClose();
    };

  return (
    <>
      <Sheet
        ref={ref}
        isOpen={isShowing}
        disableDrag={true}
        onClose={onClose}
        detent="content-height"
      >
        <Sheet.Container>
          <Sheet.Header />
          <Sheet.Content>
            <div className="flex items-start overflow-hidden">
                <div className="flex px-4 py-5 gap-4 flex-shrink-0">
                    <FaHashtag />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-2 p-2 min-h-[40px] items-center">
                        <ChipInput
                            chips={tags}
                            onChipsChange={handleTagsChange}
                            placeholder="Add tags..."
                            allowDuplicates={false}
                            maxChips={10}
                            color="primary"
                            size="small"
                        />
                    </div>
                </div>
                <div className="flex-shrink-0 w-24 px-4 py-2 flex justify-end">
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 text-black font-bold rounded hover:bg-gray-100 transition-colors duration-200 border-none"
                    >
                        Confirm
                    </button>
                </div>
            </div>
          </Sheet.Content>
        </Sheet.Container>
        <Sheet.Backdrop onTap={handleBackdropTap} />
      </Sheet>
    </>
  );
};

export default TagEditorComponent;
