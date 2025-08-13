import React, {
    type ReactNode,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { createPortal } from "react-dom";

type DropDownContextType = {
    registerItem: (ref: React.RefObject<HTMLButtonElement | null>) => void;
};

const DropDownContext = React.createContext<DropDownContextType | null>(null);

export function DropDownItem({
    children,
    onClick,
    isActive = false,
    icon,
}: {
    children: React.ReactNode;
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
    isActive?: boolean;
    icon?: React.ReactNode;
}) {
    const ref = useRef<HTMLButtonElement>(null);
    const dropDownContext = React.useContext(DropDownContext);

    if (!dropDownContext) {
        throw new Error("DropDownItem must be used within a DropDown");
    }

    const { registerItem } = dropDownContext;

    useEffect(() => {
        if (ref.current) {
            registerItem(ref);
        }
    }, [registerItem]);

    return (
        <button
            ref={ref}
            onClick={onClick}
            type="button"
            className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded transition-colors focus:outline-none ${
                isActive
                    ? "bg-blue-100 text-blue-800 border border-blue-200"
                    : "text-gray-700 hover:bg-gray-100 border border-transparent"
            }`}
        >
            <span className="text-left">{children}</span>
            {icon && <span className="ml-2">{icon}</span>}
        </button>
    );
}

function DropDownItems({
    children,
    dropDownRef,
    onClose,
}: {
    children: React.ReactNode;
    dropDownRef: React.Ref<HTMLDivElement>;
    onClose: () => void;
}) {
    const [items, setItems] = useState<
        React.RefObject<HTMLButtonElement | null>[]
    >([]);
    const [highlightedItem, setHighlightedItem] =
        useState<React.RefObject<HTMLButtonElement | null>>();

    const registerItem = useCallback(
        (itemRef: React.RefObject<HTMLButtonElement | null>) => {
            setItems((prev) => (prev ? [...prev, itemRef] : [itemRef]));
        },
        []
    );

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (!items.length) return;
        const key = event.key;

        if (["Escape", "ArrowUp", "ArrowDown", "Tab"].includes(key)) {
            event.preventDefault();
        }

        if (key === "Escape" || key === "Tab") {
            onClose();
        } else if (key === "ArrowUp") {
            setHighlightedItem((prev) => {
                if (!prev) return items[0];
                const index = items.indexOf(prev) - 1;
                return items[index === -1 ? items.length - 1 : index];
            });
        } else if (key === "ArrowDown") {
            setHighlightedItem((prev) => {
                if (!prev) return items[0];
                return items[items.indexOf(prev) + 1] || items[0];
            });
        }
    };

    const contextValue = useMemo(() => ({ registerItem }), [registerItem]);

    useEffect(() => {
        if (items.length && !highlightedItem) {
            setHighlightedItem(items[0]);
        }
        if (highlightedItem?.current) {
            highlightedItem.current.focus();
        }
    }, [items, highlightedItem]);

    return (
        <DropDownContext.Provider value={contextValue}>
            <div
                ref={dropDownRef}
                onKeyDown={handleKeyDown}
                className="bg-white border border-gray-300 rounded-lg shadow-lg z-50 fixed flex flex-col items-start gap-4 p-4"
                style={{
                    width: "257px",
                }}
            >
                {children}
            </div>
        </DropDownContext.Provider>
    );
}

export default function DropDown({
    trigger,
    children,
    stopCloseOnClickSelf = true, // Default to true for multi-select
}: {
    trigger: ReactNode;
    children: ReactNode;
    stopCloseOnClickSelf?: boolean;
}) {
    const dropDownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [showDropDown, setShowDropDown] = useState(false);
    const dropDownPadding = 4;

    const handleClose = () => {
        setShowDropDown(false);
    };

    // Position menu - always flip up
    useEffect(() => {
        const button = buttonRef.current;
        const dropDown = dropDownRef.current;

        if (showDropDown && button && dropDown) {
            const { top, left } = button.getBoundingClientRect();
            const menuHeight = dropDown.offsetHeight;

            // Always position above the button
            dropDown.style.top = `${top - menuHeight - dropDownPadding}px`;
            dropDown.style.left = `${Math.min(
                left,
                window.innerWidth - dropDown.offsetWidth - 20
            )}px`;
        }
    }, [showDropDown]);

    // Close on outside click
    useEffect(() => {
        if (!showDropDown) return;
        const button = buttonRef.current;
        const handle = (event: MouseEvent) => {
            if (!(event.target instanceof Node)) return;
            if (
                stopCloseOnClickSelf &&
                dropDownRef.current?.contains(event.target)
            ) {
                return;
            }
            if (!button?.contains(event.target)) {
                setShowDropDown(false);
            }
        };
        document.addEventListener("click", handle);
        return () => document.removeEventListener("click", handle);
    }, [showDropDown, stopCloseOnClickSelf]);

    return (
        <>
            <button
                type="button"
                className="flex items-center justify-center w-8 h-8"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowDropDown((o) => !o);
                }}
                onMouseDown={(e) => {
                    // Prevent the button from taking focus
                    e.preventDefault();
                }}
                onTouchStart={(e) => {
                    // Prevent focus on touch devices
                    e.preventDefault();
                }}
                ref={buttonRef}
                style={{
                    WebkitTapHighlightColor: "transparent",
                    touchAction: "manipulation",
                }}
                tabIndex={-1}
            >
                {trigger}
            </button>

            {showDropDown &&
                createPortal(
                    <DropDownItems
                        dropDownRef={dropDownRef}
                        onClose={handleClose}
                    >
                        {children}
                    </DropDownItems>,
                    document.body
                )}
        </>
    );
}
