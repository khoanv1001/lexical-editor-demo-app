import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    define: {
        global: "globalThis",
    },
    resolve: {
        // Fix module resolution issues
        conditions: ["import", "module", "browser", "default"],
        mainFields: ["module", "browser", "main"],
    },
    optimizeDeps: {
        // Force pre-bundling of problematic packages
        include: [
            "lexical",
            "@lexical/react/LexicalComposer",
            "@lexical/react/LexicalContentEditable",
            "@lexical/react/LexicalErrorBoundary",
            "@lexical/react/LexicalHistoryPlugin",
            "@lexical/react/LexicalPlainTextPlugin",
            "@lexical/react/LexicalRichTextPlugin",
            "@lexical/react/LexicalAutoFocusPlugin",
            "@lexical/react/LexicalOnChangePlugin",
            "@lexical/react/useLexicalComposerContext",
            "@lexical/html",
            "@lexical/utils",
        ],
    },
    // Use relative paths for WKWebView compatibility
    base: "./",
    mode: "production",
    build: {
        commonjsOptions: {
            // Handle CommonJS modules properly
            include: [/node_modules/],
            transformMixedEsModules: true,
        },
        // Optimize output for mobile WebView
        rollupOptions: {
            output: {
                // Use consistent file names for easier loading
                entryFileNames: "assets/[name]-[hash].js",
                chunkFileNames: "assets/[name]-[hash].js",
                assetFileNames: "assets/[name]-[hash].[ext]",
                // Split vendor chunks for better caching
                manualChunks: {
                    vendor: ["react", "react-dom"],
                    lexical: ["lexical", "@lexical/html", "@lexical/utils"],
                },
            },
        },
        // Generate source maps for debugging
        sourcemap: false,
        // Optimize for mobile performance
        minify: "terser",
        target: ["es2015", "safari11"],
        // Ensure CSS is inlined for WKWebView
        cssCodeSplit: false,
    },
    server: {
        host: true,
        port: 8080,
    },
});
