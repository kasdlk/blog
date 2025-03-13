// ThemeContext.tsx
import { createContext } from "react";

export interface ThemeContextProps {
    darkMode: boolean;
    toggleDarkMode: () => void;
}

export const ThemeContext = createContext<ThemeContextProps>({
    darkMode: false,
    toggleDarkMode: () => {},
});
