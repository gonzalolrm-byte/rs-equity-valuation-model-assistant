/**
 * Layout & Size editing layer.
 *
 * Presentation only: it applies saved width/height/spacing/table overrides to
 * visible components and, while "Layout & Size" edit mode is on, lets the
 * developer click any component, drag its edges, or type exact values.
 *
 * Overrides are keyed by `${scope}|${cssPath}` where the scope is "developer"
 * for the Developer Console and "user" for every end-user page, so layout work
 * in one interface never changes the other. Nothing here touches application
 * logic, calculations, field definitions, workflow dependencies, data mappings
 * or template generation — only CSS box properties on the selected element.
 */
import { useLocation } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useUiContentSafe, type UiLayoutOverride } from "@/lib/ui-content";

const MANAGED_PROPS = [
  "width",
  "height",
  "minWidth",
  "maxWidth",
  "minHeight",
  "maxHeight",
  "padding",
  "margin",
  "columnGap",
  "rowGap",
  "whiteSpace",
  "textAlign",
  "verticalAlign",
] as const;

export function scopeForPath(pathname: string) {
  return pathname.startsWith("/developer") ? "developer" : "user";
}

/** Stable-enough CSS path for an element inside the app shell. */
export function cssPathFor(element: Element): string | null {
  const parts: string[] = [];
  let current: Element | null = element;
  while (current && current !== document.body) {
    const parent: Element | null = current.parentElement;
    if (!parent) return null;
    const tag = current.tagName.toLowerCase();
    const index =
      Array.from(parent.children).filter((child) => child.tagName === current!.tagName).indexOf(
        current,
      ) + 1;
    parts.unshift(`${tag}:nth-of-type(${index})`);
    current = parent;
  }
  if (!parts.length) return null;
  return `body > ${parts.join(" > ")}`;
}

function isEditorChrome(element: Element | null) {
  return !!element?.closest("[data-ui-editor]");
}

export function UiLayoutEditor() {
  const ui = useUiContentSafe();
  const location = useLocation();
  const scope = scopeForPath(location.pathname);
  const appliedRef = useRef<Set<HTMLElement>>(new Set());
  const [hoverRect, setHoverRect] = useState<DOMRect | null>(null);
  const [selectedRect, setSelectedRect] = useState<DOMRect | null>(null);

  const layout = ui?.layout ?? {};
  const layoutActive = !!ui?.editing && ui.editMode === "layout";
  const selectedPath = ui?.selectedPath ?? null;

  /** Applies every saved override for the current scope to the live DOM. */
  const apply = useCallback(() => {
    for (const element of appliedRef.current) {
      for (const prop of MANAGED_PROPS) element.style.removeProperty(kebab(prop));
    }
    appliedRef.current = new Set();
    for (const [key, override] of Object.entries(layout)) {
      const [entryScope, path] = splitKey(key);
      if (entryScope !== scope || !path) continue;
      let element: HTMLElement | null = null;
      try {
        element = document.querySelector<HTMLElement>(path);
      } catch {
        element = null;
      }
      if (!element || isEditorChrome(element)) continue;
      for (const prop of MANAGED_PROPS) {
        const value = override[prop];
        if (value) element.style.setProperty(kebab(prop), value);
      }
      appliedRef.current.add(element);
    }
  }, [layout, scope]);

  useEffect(() => {
    apply();
    const observer = new MutationObserver(() => apply());
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [apply]);

  // Keep the selection outline aligned while the page scrolls or reflows.
  useEffect(() => {
    if (!layoutActive) {
      setSelectedRect(null);
      setHoverRect(null);
      return;
    }
    const sync = () => {
      if (!selectedPath) {
        setSelectedRect(null);
        return;
      }
      const [, path] = splitKey(selectedPath);
      let element: HTMLElement | null = null;
      try {
        element = path ? document.querySelector<HTMLElement>(path) : null;
      } catch {
        element = null;
      }
      setSelectedRect(element ? element.getBoundingClientRect() : null);
    };
    sync();
    const id = window.setInterval(sync, 200);
    window.addEventListener("scroll", sync, true);
    window.addEventListener("resize", sync);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("scroll", sync, true);
      window.removeEventListener("resize", sync);
    };
  }, [layoutActive, selectedPath, layout]);

  useEffect(() => {
    if (!layoutActive || !ui) return;
    const onMove = (event: MouseEvent) => {
      const target = event.target as Element | null;
      if (!target || isEditorChrome(target)) {
        setHoverRect(null);
        return;
      }
      setHoverRect(target.getBoundingClientRect());
    };
    const onClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      if (!target || isEditorChrome(target)) return;
      event.preventDefault();
      event.stopPropagation();
      const path = cssPathFor(target);
      if (path) ui.selectPath(`${scope}|${path}`);
    };
    document.addEventListener("mousemove", onMove, true);
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("mousemove", onMove, true);
      document.removeEventListener("click", onClick, true);
    };
  }, [layoutActive, scope, ui]);

  if (!ui) return null;

  const startDrag = (event: React.PointerEvent, axis: "x" | "y" | "both") => {
    if (!selectedPath || !selectedRect) return;
    event.preventDefault();
    const startX = event.clientX;
    const startY = event.clientY;
    const startWidth = Math.round(selectedRect.width);
    const startHeight = Math.round(selectedRect.height);
    const onMove = (moveEvent: PointerEvent) => {
      const patch: UiLayoutOverride = {};
      if (axis !== "y") patch.width = `${Math.max(24, startWidth + moveEvent.clientX - startX)}px`;
      if (axis !== "x") patch.height = `${Math.max(16, startHeight + moveEvent.clientY - startY)}px`;
      ui.setLayoutOverride(selectedPath, patch);
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  if (!layoutActive) return null;

  return (
    <div data-ui-editor className="pointer-events-none fixed inset-0 z-40">
      {hoverRect && (!selectedRect || hoverRect.top !== selectedRect.top) && (
        <div
          className="absolute border border-dashed border-primary/60"
          style={frame(hoverRect)}
        />
      )}
      {selectedRect && (
        <>
          <div className="absolute border-2 border-primary" style={frame(selectedRect)} />
          <span
            className="absolute -translate-y-full rounded-t bg-primary px-1.5 py-0.5 text-[11px] font-semibold text-primary-foreground"
            style={{ left: selectedRect.left, top: selectedRect.top }}
          >
            {Math.round(selectedRect.width)} × {Math.round(selectedRect.height)}
          </span>
          <div
            role="presentation"
            onPointerDown={(event) => startDrag(event, "x")}
            className="pointer-events-auto absolute w-2 cursor-ew-resize rounded bg-primary/70"
            style={{
              left: selectedRect.right - 4,
              top: selectedRect.top + selectedRect.height / 2 - 12,
              height: 24,
            }}
          />
          <div
            role="presentation"
            onPointerDown={(event) => startDrag(event, "y")}
            className="pointer-events-auto absolute h-2 cursor-ns-resize rounded bg-primary/70"
            style={{
              left: selectedRect.left + selectedRect.width / 2 - 12,
              top: selectedRect.bottom - 4,
              width: 24,
            }}
          />
          <div
            role="presentation"
            onPointerDown={(event) => startDrag(event, "both")}
            className="pointer-events-auto absolute size-3 cursor-nwse-resize rounded-sm bg-primary"
            style={{ left: selectedRect.right - 6, top: selectedRect.bottom - 6 }}
          />
        </>
      )}
    </div>
  );
}

function frame(rect: DOMRect) {
  return { left: rect.left, top: rect.top, width: rect.width, height: rect.height } as const;
}

function splitKey(key: string): [string, string | undefined] {
  const index = key.indexOf("|");
  if (index < 0) return [key, undefined];
  return [key.slice(0, index), key.slice(index + 1)];
}

function kebab(prop: string) {
  return prop.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}
