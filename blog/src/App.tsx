// App.tsx
import { useMemo, useState } from "react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import './index.css';
import AppRouter from './router/AppRouter';
import TrailingEffect from "./components/TrailingEffect";
import { ThemeContext } from "./ThemeContext";

function App() {
    const [darkMode, setDarkMode] = useState(false);


    const toggleDarkMode = () => {
        setDarkMode((prev) => !prev);
    };

    // 根据 darkMode 创建主题
    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode: darkMode ? "dark" : "light",
                },
            }),
        [darkMode]
    );

    return (
        <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <div className="App">
                    <TrailingEffect />
                    <AppRouter />
                </div>
            </ThemeProvider>
        </ThemeContext.Provider>
    );
}

export default App;
