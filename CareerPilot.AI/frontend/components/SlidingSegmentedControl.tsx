import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from "react";

export interface SlidingTabItem {
  id: string;
  label: string;
}

interface SlidingSegmentedControlProps {
  tabs: SlidingTabItem[];
  activeId: string;
  onChange: (id: string) => void;
}

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export const SlidingSegmentedControl: React.FC<SlidingSegmentedControlProps> = ({
  tabs,
  activeId,
  onChange,
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [indicatorStyle, setIndicatorStyle] = useState<{ x: number; width: number; opacity: number }>({
    x: 0,
    width: 0,
    opacity: 0,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  const targetId = hoveredId || activeId;

  const updateIndicator = useCallback(() => {
    const currentTab = tabRefs.current[targetId];
    const container = containerRef.current;

    if (currentTab && container) {
      const tabRect = currentTab.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      setIndicatorStyle({
        x: tabRect.left - containerRect.left,
        width: tabRect.width,
        opacity: 1,
      });
    }
  }, [targetId]);

  useIsomorphicLayoutEffect(() => {
    updateIndicator();
  }, [updateIndicator, tabs]);

  useEffect(() => {
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [updateIndicator]);

  return (
    <div
      ref={containerRef}
      onMouseLeave={() => setHoveredId(null)}
      className="relative inline-flex min-w-full sm:min-w-0 p-1 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/70 backdrop-blur-md overflow-x-auto no-scrollbar"
    >
      {/* GPU-Accelerated Dynamic Island 3D Magnetic Sliding Pill */}
      <div
        className="absolute top-1 bottom-1 dynamic-island-pill rounded-xl pointer-events-none"
        style={{
          transform: `translateX(${indicatorStyle.x}px) translateZ(0)`,
          width: `${indicatorStyle.width}px`,
          opacity: indicatorStyle.opacity,
          transition: "transform 340ms cubic-bezier(0.34, 1.35, 0.64, 1), width 340ms cubic-bezier(0.34, 1.35, 0.64, 1), opacity 150ms ease-out",
          willChange: "transform, width",
        }}
      />

      {/* Tab Buttons */}
      {tabs.map((tab) => {
        const isActive = activeId === tab.id;
        const isHovered = hoveredId === tab.id;
        return (
          <button
            key={tab.id}
            ref={(el) => {
              tabRefs.current[tab.id] = el;
            }}
            type="button"
            onMouseEnter={() => setHoveredId(tab.id)}
            onClick={() => onChange(tab.id)}
            className={`relative z-10 px-4 py-2 rounded-xl text-xs whitespace-nowrap transition-all duration-200 font-bold active:scale-[0.97] ${
              isActive || isHovered
                ? "text-indigo-950 dark:text-white"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default SlidingSegmentedControl;
