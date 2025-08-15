import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import AppRedirect from "./components/AppRedirect";
import LexicalEditor from "./components/LexicalEditor";
import TestPage from "./components/TestPage";
import { useEffect } from "react";

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
                                <LexicalEditor
                                    placeholder="書く"
                                    onContentChange={handleContentChange}
                                    isRichText={true}
                                />
                            </main>
                        }
                    />

                    {/* iOS app redirect route */}
                    <Route
                        path="/open-app"
                        element={
                            <AppRedirect
                                config={{
                                    scheme: "your-app-scheme", // Replace with your actual app scheme
                                    appStoreUrl:
                                        "https://apps.apple.com/app/your-app-id", // Replace with your App Store URL
                                    fallbackUrl: "/", // Fallback to home page for non-iOS users
                                    timeout: 2500,
                                }}
                            />
                        }
                    />

                    {/* Example: iOS app redirect with specific path */}
                    <Route
                        path="/open-app/:path"
                        element={
                            <AppRedirect
                                config={{
                                    scheme: "your-app-scheme",
                                    appStoreUrl:
                                        "https://apps.apple.com/app/your-app-id",
                                    fallbackUrl: "/",
                                    timeout: 2500,
                                }}
                                path="specific-feature" // This will create: your-app-scheme://specific-feature
                            />
                        }
                    />

                    {/* Test page for iOS redirect functionality */}
                    <Route path="/test" element={<TestPage />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
