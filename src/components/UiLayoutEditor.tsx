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
import { Move } from "lucide-react";
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
  "position",
  "transform",
  "display",
] as const;

export function scopeForPath(pathname: string) {
  return pathname.startsWith("/developer") ? "developer" : "user";
}

/**
 * Stable-enough path for an element inside the app shell. The editor's own
 * toolbars and overlays are ignored when counting siblings, so a path recorded
 * while editing still resolves once edit mode is switched off.
 */
export function cssPathFor(element: Element): string | null {
  const parts: string[] = [];
  let current: Element | null = element;
  while (current && current !== document.body) {
    const parent: Element | null = current.parentElement;
    if (!parent) return null;
    const tag = current.tagName.toLowerCase();
    const index = siblingsOfTag(parent, current.tagName).indexOf(current) + 1;
    if (index < 1) return null;
    parts.unshift(`${tag}:nth-of-type(${index})`);
    current = parent;
  }
  if (!parts.length) return null;
  return `body > ${parts.join(" > ")}`;
}

function siblingsOfTag(parent: Element, tagName: string) {
  return Array.from(parent.children).filter(
    (child) => child.tagName === tagName && !child.hasAttribute("data-ui-editor"),
  );
}

/** Resolves a path produced by `cssPathFor`, skipping editor chrome siblings. */
export function resolvePath(path: string): HTMLElement | null {
  const parts = path.replace(/^body\s*>\s*/, "").split(">");
  let current: Element | null = document.body;
  for (const rawPart of parts) {
    const match = rawPart.trim().match(/^([a-z0-9-]+):nth-of-type\((\d+)\)$/i);
    if (!match || !current) return null;
    const tag = (match[1] as string).toUpperCase();
    const index = Number(match[2]) - 1;
    const next: Element | undefined = siblingsOfTag(current, tag)[index];
    if (!next) return null;
    current = next;
  }
  return current instanceof HTMLElement && current !== document.body ? current : null;
}

function isEditorChrome(element: Element | null) {
  return !!element?.closest("[data-ui-editor]");
}

/** True for elements whose whole content is a single run of text. */
export function isTextLeaf(element: Element) {
  if (!(element instanceof HTMLElement)) return false;
  if (element.querySelector("*")) return false;
  if (["INPUT", "TEXTAREA", "SELECT", "IMG", "SVG", "PATH"].includes(element.tagName)) return false;
  return !!element.textContent?.trim();
}

export function UiLayoutEditor() {
  const ui = useUiContentSafe();
  const location = useLocation();
  const scope = scopeForPath(location.pathname);
  const appliedRef = useRef<Set<HTMLElement>>(new Set());
  const textAppliedRef = useRef<Map<HTMLElement, string>>(new Map());
  const [hoverRect, setHoverRect] = useState<DOMRect | null>(null);
  const [selectedRect, setSelectedRect] = useState<DOMRect | null>(null);

  const layout = ui?.layout ?? {};
  const pathText = ui?.pathText ?? {};
  const layoutActive = !!ui?.editing && ui.editMode === "layout";
  const textActive = !!ui?.editing && ui.editMode === "text";
  const pickerActive = layoutActive || textActive;
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
      const element = resolvePath(path);
      if (!element || isEditorChrome(element)) continue;
      for (const prop of MANAGED_PROPS) {
        const value = override[prop as keyof UiLayoutOverride];
        if (typeof value === "string" && value) element.style.setProperty(kebab(prop), value);
      }
      // Presentation-only delete: hide the component entirely.
      if (override.hidden) element.style.setProperty("display", "none", "important");
      // Free repositioning via the move handle.
      if (override.offsetX || override.offsetY) {
        element.style.setProperty("position", "relative");
        element.style.setProperty(
          "transform",
          `translate(${override.offsetX || "0px"}, ${override.offsetY || "0px"})`,
        );
      }
      appliedRef.current.add(element);
    }
    // Wording overrides for text picked straight off the page.
    for (const [element, original] of textAppliedRef.current) {
      if (element.isConnected && element.textContent !== original) element.textContent = original;
    }
    textAppliedRef.current = new Map();
    for (const [key, text] of Object.entries(pathText)) {
      const [entryScope, path] = splitKey(key);
      if (entryScope !== scope || !path) continue;
      const element = resolvePath(path);
      if (!element || isEditorChrome(element) || !isTextLeaf(element)) continue;
      const original = element.textContent ?? "";
      if (original === text) continue;
      textAppliedRef.current.set(element, original);
      element.textContent = text;
    }
  }, [layout, pathText, scope]);

  useEffect(() => {
    let applying = false;
    const run = () => {
      if (applying) return;
      applying = true;
      apply();
      // Ignore the mutations our own DOM writes produce.
      window.setTimeout(() => {
        applying = false;
      }, 0);
    };
    run();
    const observer = new MutationObserver(run);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [apply]);

  // Keep the selection outline aligned while the page scrolls or reflows.
  useEffect(() => {
    if (!pickerActive) {
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
      const element = path ? resolvePath(path) : null;
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
  }, [pickerActive, selectedPath, layout, pathText]);

  useEffect(() => {
    if (!pickerActive || !ui) return;
    const onMove = (event: MouseEvent) => {
      const target = event.target as Element | null;
      if (!target || isEditorChrome(target)) {
        setHoverRect(null);
        return;
      }
      // In text mode only highlight elements whose text can be rewritten.
      if (textActive && !isTextLeaf(target)) {
        setHoverRect(null);
        return;
      }
      setHoverRect(target.getBoundingClientRect());
    };
    const onClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      if (!target || isEditorChrome(target)) return;
      // Registered EditableText content keeps its own editor.
      if (textActive && target.closest("[data-ui-key]")) return;
      if (textActive && !isTextLeaf(target)) return;
      event.preventDefault();
      event.stopPropagation();
      const path = cssPathFor(target);
      if (!path) return;
      if (textActive) ui.select(null);
      ui.selectPath(`${scope}|${path}`);
    };
    document.addEventListener("mousemove", onMove, true);
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("mousemove", onMove, true);
      document.removeEventListener("click", onClick, true);
    };
  }, [pickerActive, textActive, scope, ui]);

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

  if (!pickerActive) return null;

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
            {textActive
              ? "Editing text"
              : `${Math.round(selectedRect.width)} × ${Math.round(selectedRect.height)}`}
          </span>
          {layoutActive && (
          <>
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
