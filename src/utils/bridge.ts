/* eslint-disable @typescript-eslint/no-explicit-any */
// utils/bridge.ts

declare global {
    interface Window {
        webkit?: {
            messageHandlers?: {
                content?: {
                    postMessage: (message: any) => void;
                };
            };
        };
        SwiftUIBridge?: typeof SwiftUIBridge;
    }
}

type NativeMessageHandler = (message: any) => void;

class SwiftUIBridge {
    private static listeners: NativeMessageHandler[] = [];

    // Send message to SwiftUI (native side)
    static postMessage(message: any) {
        if (
            window.webkit &&
            window.webkit.messageHandlers &&
            window.webkit.messageHandlers["content"]
        ) {
            window.webkit.messageHandlers["content"].postMessage(message);
        } else {
            console.warn(
                `Handler "${"content"}" is not available on window.webkit.messageHandlers`
            );
        }
    }

    // Register callback to handle messages from SwiftUI
    static onMessage(callback: NativeMessageHandler) {
        SwiftUIBridge.listeners.push(callback);
    }

    // Called from SwiftUI (inject this into your React app)
    static handleNativeMessage(message: any) {
        for (const listener of SwiftUIBridge.listeners) {
            listener(message);
        }
    }
}

if (typeof window !== "undefined") {
    window.SwiftUIBridge = SwiftUIBridge;
}

export default SwiftUIBridge;
