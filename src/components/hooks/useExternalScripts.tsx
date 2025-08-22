import { useEffect } from "react";
import { WIDGET_SCRIPT_URL } from "../Lexical/nodes/TweetNode/TweetComponent";
import { WIDGET_INSTAGRAM_SCRIPT_URL } from "../Lexical/nodes/InstagramNode/InstagramComponent";

const EXTERNAL_SCRIPTS = [WIDGET_SCRIPT_URL, WIDGET_INSTAGRAM_SCRIPT_URL];

export function useExternalScripts() {
    useEffect(() => {
        const loadedScripts: HTMLScriptElement[] = [];

        EXTERNAL_SCRIPTS.forEach((src) => {
            if (document.querySelector(`script[src="${src}"]`)) {
                return;
            }

            const script = document.createElement("script");
            script.async = true;
            script.src = src;
            document.head.appendChild(script);
            loadedScripts.push(script);
        });

        // Cleanup
        return () => {
            loadedScripts.forEach((script) => {
                if (document.head.contains(script)) {
                    document.head.removeChild(script);
                }
            });
        };
    }, []);
}
