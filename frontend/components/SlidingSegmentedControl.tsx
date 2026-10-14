import React from "react";
import { motion, useReducedMotion } from "framer-motion";

export interface SlidingTabItem {
  id: string;
  label: string;
}

interface SlidingSegmentedControlProps {
  tabs: SlidingTabItem[];
  activeId: string;
  onChange: (id: string) => void;
}

export const SlidingSegmentedControl: React.FC<SlidingSegmentedControlProps> = ({
  tabs,
  activeId,
  onChange,
}) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="relative inline-flex min-w-full sm:min-w-0 p-1 rounded-2xl bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/70 backdrop-blur-md overflow-x-auto no-scrollbar">
      {tabs.map((tab) => {
        const isActive = activeId === tab.id;
        return (
          <motion.button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            whileTap={{ scale: 0.97 }}
            className={`relative px-4 py-2 rounded-xl text-xs whitespace-nowrap font-bold transition-colors duration-150 ${
              isActive
                ? "text-indigo-950 dark:text-white"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="activeSegmentIndicator"
                className="absolute inset-0 dynamic-island-pill rounded-xl pointer-events-none"
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 420, damping: 32 }
                }
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
};

export default SlidingSegmentedControl;
