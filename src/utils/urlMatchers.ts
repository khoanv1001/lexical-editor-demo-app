// urlMatchers.ts

export const URL_REGEX =
    /((https?:\/\/(www\.)?)|(www\.))[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)(?<![-.+():%])/;

import type { LinkMatcher } from "@lexical/react/LexicalAutoLinkPlugin";

export function createUrlMatchers(
    createLinkMatcherWithRegExp: (
        regex: RegExp,
        callback: (text: string) => string
    ) => LinkMatcher
): LinkMatcher[] {
    return [
        createLinkMatcherWithRegExp(URL_REGEX, (text: string) => {
            return text.startsWith("http") ? text : `https://${text}`;
        }),
    ];
}
