import { useEffect } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import LexicalEditor from "./components/LexicalEditor";
import { t } from "./i18n";
import { ToolbarContext } from "./components/Lexical/plugins/ToolbarPlugin/ToolbarContext";

function App() {
    useEffect(() => {
        document.addEventListener("touchstart", function () {}, {
            passive: true,
        });
    }, []);

    const handleContentChange = (html: string) => {
        console.log("Editor content changed:", html);
        // Send content to native app
    };

    return (
        <Router>
            <div
                className="w-full h-screen bg-gray-50 flex
                      pl-safe-or-4 pr-safe-or-4 pb-safe-or-4"
            >
                <Routes>
                    {/* Main editor route */}
                    <Route
                        path="/"
                        element={
                            <main className="max-w-full mx-auto flex-1 flex h-full">
                                <div className="absolute top-5 right-5 z-50"></div>
                                <ToolbarContext>
                                    <LexicalEditor
                                        placeholder={t("write")}
                                        onContentChange={handleContentChange}
                                        isRichText={true}
                                    />
                                </ToolbarContext>
                            </main>
                        }
                    />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
