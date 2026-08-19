import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { ThemeProvider, useTheme } from "../context/ThemeContext";
import ThemeToggle from "../components/ThemeToggle";

// Mock matchMedia for test runner environment
let mockMediaMatches = false;
let mediaChangeListeners: Array<(e: MediaQueryListEvent) => void> = [];

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      get matches() {
        return mockMediaMatches;
      },
      media: query,
      onchange: null,
      addListener: jest.fn((cb) => mediaChangeListeners.push(cb)),
      removeListener: jest.fn(),
      addEventListener: jest.fn((event, cb) => {
        if (event === "change") mediaChangeListeners.push(cb);
      }),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
});

// Test helper component
const TestConsumer = () => {
  const { theme, isDark, systemTheme, setTheme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme-mode">{theme}</span>
      <span data-testid="is-dark">{isDark ? "dark" : "light"}</span>
      <span data-testid="sys-theme">{systemTheme}</span>
      <button data-testid="toggle-btn" onClick={toggleTheme}>
        Toggle
      </button>
      <button data-testid="set-system-btn" onClick={() => setTheme("system")}>
        Set System
      </button>
    </div>
  );
};

describe("ThemeContext & ThemeToggle", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.remove("theme-transitioning");
    mockMediaMatches = false;
    mediaChangeListeners = [];
  });

  test("ThemeProvider initializes default theme as system", () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId("theme-mode")).toHaveTextContent("system");
    expect(screen.getByTestId("is-dark")).toHaveTextContent("light");
  });

  test("Toggling theme switches between dark and light, updates localStorage and HTML class", () => {
    render(
      <ThemeProvider>
        <TestConsumer />
        <ThemeToggle />
      </ThemeProvider>
    );

    const toggleBtn = screen.getByTestId("toggle-btn");

    act(() => {
      fireEvent.click(toggleBtn);
    });

    expect(localStorage.getItem("careerpilot_theme")).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);

    act(() => {
      fireEvent.click(toggleBtn);
    });

    expect(localStorage.getItem("careerpilot_theme")).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  test("System preference change automatically adapts website in real-time", () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId("theme-mode")).toHaveTextContent("system");
    expect(document.documentElement.classList.contains("dark")).toBe(false);

    // Simulate OS system preference switching to Dark Mode
    mockMediaMatches = true;
    act(() => {
      mediaChangeListeners.forEach((listener) => {
        listener({ matches: true } as MediaQueryListEvent);
      });
    });

    expect(screen.getByTestId("is-dark")).toHaveTextContent("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });
});
