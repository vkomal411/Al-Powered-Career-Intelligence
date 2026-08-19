import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";

export type ThemeMode = "light" | "dark" | "system";

interface ThemeContextType {
  theme: ThemeMode;
  isDark: boolean;
  systemTheme: "light" | "dark";
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "system",
  isDark: false,
  systemTheme: "light",
  setTheme: () => {},
  toggleTheme: () => {},
});

const THEME_STORAGE_KEY = "careerpilot_theme";

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>("system");
  const [systemTheme, setSystemTheme] = useState<"light" | "dark">("light");
  const [isDark, setIsDark] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to trigger a smooth global CSS transition across the DOM
  const enableSmoothTransition = useCallback(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;

    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }

    root.classList.add("theme-transitioning");

    transitionTimeoutRef.current = setTimeout(() => {
      root.classList.remove("theme-transitioning");
      transitionTimeoutRef.current = null;
    }, 400);
  }, []);

  // Initialize theme from localStorage and system preference on mount
  useEffect(() => {
    setMounted(true);

    const hasMatchMedia = typeof window !== "undefined" && typeof window.matchMedia === "function";
    const mediaQuery = hasMatchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
    const sysDark = mediaQuery ? mediaQuery.matches : false;
    setSystemTheme(sysDark ? "dark" : "light");

    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
      if (saved && (saved === "light" || saved === "dark" || saved === "system")) {
        setThemeState(saved);
      } else {
        setThemeState("system");
      }
    } catch {
      setThemeState("system");
    }
  }, []);

  // Update DOM class and state whenever theme or system preference changes
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    const hasMatchMedia = typeof window !== "undefined" && typeof window.matchMedia === "function";
    const mediaQuery = hasMatchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;

    const computeIsDark = (currentTheme: ThemeMode, sysMatches: boolean): boolean => {
      if (currentTheme === "dark") return true;
      if (currentTheme === "light") return false;
      return sysMatches;
    };

    const applyTheme = (currentTheme: ThemeMode, sysMatches: boolean, animate: boolean = false) => {
      const darkActive = computeIsDark(currentTheme, sysMatches);
      setIsDark(darkActive);

      if (animate) {
        enableSmoothTransition();
      }

      if (darkActive) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    };

    const currentSysDark = mediaQuery ? mediaQuery.matches : false;
    setSystemTheme(currentSysDark ? "dark" : "light");
    applyTheme(theme, currentSysDark, mounted);

    // Live System Configuration Change Listener (Auto-adapts in real-time)
    if (mediaQuery) {
      const handleMediaChange = (e: MediaQueryListEvent | MediaQueryList) => {
        const matches = "matches" in e ? e.matches : Boolean(e);
        const newSys = matches ? "dark" : "light";
        setSystemTheme(newSys);

        // If user is on 'system' mode, automatically adapt the website with smooth animation
        setThemeState((currentMode) => {
          if (currentMode === "system") {
            applyTheme("system", matches, true);
          }
          return currentMode;
        });
      };

      if (typeof mediaQuery.addEventListener === "function") {
        mediaQuery.addEventListener("change", handleMediaChange);
        return () => {
          mediaQuery.removeEventListener("change", handleMediaChange);
          if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
        };
      } else if (typeof (mediaQuery as unknown as { addListener?: (cb: (e: MediaQueryListEvent) => void) => void }).addListener === "function") {
        const legacyQuery = mediaQuery as unknown as {
          addListener: (cb: (e: MediaQueryListEvent) => void) => void;
          removeListener: (cb: (e: MediaQueryListEvent) => void) => void;
        };
        legacyQuery.addListener(handleMediaChange);
        return () => {
          legacyQuery.removeListener(handleMediaChange);
          if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
        };
      }
    }
  }, [theme, mounted, enableSmoothTransition]);

  const setTheme = (mode: ThemeMode) => {
    enableSmoothTransition();
    setThemeState(mode);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (e) {
      console.warn("Failed to persist theme preference to localStorage:", e);
    }
  };

  const toggleTheme = () => {
    enableSmoothTransition();
    const nextMode: ThemeMode = isDark ? "light" : "dark";
    setTheme(nextMode);
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, systemTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
