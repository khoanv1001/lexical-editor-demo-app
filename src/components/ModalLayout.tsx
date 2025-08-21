import {
    Description,
    DialogPanel,
    DialogTitle,
    TransitionChild,
} from "@headlessui/react";
import clsx from "clsx";
import { Fragment, type ReactNode } from "react";

type Props = {
    title: string;
    body: ReactNode;
    footer: ReactNode;
    isDanger?: boolean;
};

const Layout = ({ title, body, footer, isDanger = false }: Props) => {
    return (
        <>
            <TransitionChild
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
            >
                <div
                    className="fixed inset-0 z-50 bg-slate-700/60 backdrop-blur-md backdrop-brightness-75"
                    aria-hidden="true"
                />
            </TransitionChild>
            <div className="fixed inset-0 overflow-y-auto z-50">
                <div className="flex min-h-full justify-center items-start pt-32">
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <DialogPanel className="w-full max-w-lg transform overflow-hidden rounded-lg bg-k-indigo-50 text-left align-middle shadow-xl">
                            <DialogTitle
                                className={clsx(
                                    "p-4 font-bold text-center bg-k-indigo-100/60 backdrop-brightness-125 rounded-t-lg",
                                    isDanger && "text-red-700"
                                )}
                            >
                                {title}
                            </DialogTitle>
                            <Description as="div" className="p-4">
                                {body}
                            </Description>
                            {footer && (
                                <div className="p-4 flex gap-4 justify-end">
                                    {footer}
                                </div>
                            )}
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </div>
        </>
    );
};

export default Layout;
