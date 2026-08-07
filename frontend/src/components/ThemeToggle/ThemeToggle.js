import React from "react";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";
import { useTheme } from "../ThemeContext/ThemeContext";

function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
}

export default function ThemeToggle({ className, showLabel = false }) {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === "dark";

    return (
        <button
            type="button"
            onClick={toggleTheme}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className={classNames(
                "flex items-center justify-center rounded-lg p-2 transition-colors",
                className
            )}
        >
            {isDark ? (
                <SunIcon className="w-[18px] h-[18px] flex-shrink-0" />
            ) : (
                <MoonIcon className="w-[18px] h-[18px] flex-shrink-0" />
            )}
            {showLabel ? (
                <span>{isDark ? "Light mode" : "Dark mode"}</span>
            ) : (
                <span className="sr-only">Toggle theme</span>
            )}
        </button>
    );
}
