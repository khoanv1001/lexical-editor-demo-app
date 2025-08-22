import { Fragment, useCallback, useMemo, useState, type JSX } from "react";
import { Dialog, Transition } from "@headlessui/react";

export const useModal = (): [
    JSX.Element | null,
    (getContent: (onClose: () => void) => JSX.Element) => void,
] => {
    const [modalContent, setModalContent] = useState<null | JSX.Element>(null);

    const [isShow, setIsShow] = useState<boolean>(false);

    const onClose = useCallback(() => {
        setIsShow(false);
    }, []);

    const handleAfterLeave = useCallback(() => {
        setModalContent(null);
    }, []);

    const modal = useMemo(() => {
        return (
            <Transition
                appear
                show={isShow}
                as={Fragment}
                afterLeave={handleAfterLeave}
            >
                <Dialog onClose={onClose}>{modalContent}</Dialog>
            </Transition>
        );
    }, [isShow, modalContent, onClose, handleAfterLeave]);

    const showModal = useCallback(
        (getContent: (onClose: () => void) => JSX.Element) => {
            setModalContent(getContent(onClose));
            setIsShow(true);
        },
        [onClose]
    );

    return [modal, showModal];
};

export default useModal;
