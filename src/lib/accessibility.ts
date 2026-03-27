/**
 * Section 8 — Accessibility utilities.
 * Focus trapping, screen-reader announcements, contrast checking,
 * keyboard navigation for data tables.
 */

/* ─────────────────── Focus ring class ─────────────────── */

export const FOCUS_RING_CLASS =
  "focus-visible:ring-2 focus-visible:ring-[var(--color-brand-400)] focus-visible:ring-offset-2";

/* ─────────────────── Focus trap ─────────────────── */

export function trapFocus(element: HTMLElement): () => void {
  const focusableSelector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(", ");

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== "Tab") return;

    const focusableElements = element.querySelectorAll<HTMLElement>(focusableSelector);
    if (focusableElements.length === 0) return;

    const first = focusableElements[0];
    const last = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  element.addEventListener("keydown", handleKeyDown);

  // Focus the first focusable element
  const firstFocusable = element.querySelector<HTMLElement>(focusableSelector);
  firstFocusable?.focus();

  return () => {
    element.removeEventListener("keydown", handleKeyDown);
  };
}

/* ─────────────────── Screen reader announcements ─────────────────── */

export function announceToScreenReader(message: string): void {
  const region = document.createElement("div");
  region.setAttribute("aria-live", "assertive");
  region.setAttribute("aria-atomic", "true");
  region.setAttribute("role", "status");
  // Visually hidden but accessible
  Object.assign(region.style, {
    position: "absolute",
    width: "1px",
    height: "1px",
    padding: "0",
    margin: "-1px",
    overflow: "hidden",
    clip: "rect(0, 0, 0, 0)",
    whiteSpace: "nowrap",
    border: "0",
  });

  document.body.appendChild(region);

  // Small delay so the live region is registered before content is added
  requestAnimationFrame(() => {
    region.textContent = message;

    // Remove after announcement has been read
    setTimeout(() => {
      document.body.removeChild(region);
    }, 3000);
  });
}

/* ─────────────────── Contrast ratio ─────────────────── */

function parseHexColor(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const fullHex =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;

  const num = parseInt(fullHex, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Computes WCAG 2.1 contrast ratio between two hex colors.
 * Returns a value between 1 and 21.
 */
export function getContrastRatio(fg: string, bg: string): number {
  const [r1, g1, b1] = parseHexColor(fg);
  const [r2, g2, b2] = parseHexColor(bg);

  const l1 = relativeLuminance(r1, g1, b1);
  const l2 = relativeLuminance(r2, g2, b2);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/* ─────────────────── Keyboard table navigation ─────────────────── */

/**
 * Sets up arrow-key navigation for data table cells.
 * Supports ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Home, End.
 */
export function setupKeyboardNavigation(tableElement: HTMLElement): () => void {
  const getCells = (): HTMLElement[][] => {
    const rows = tableElement.querySelectorAll<HTMLTableRowElement>("tr");
    return Array.from(rows).map((row) =>
      Array.from(row.querySelectorAll<HTMLElement>("td, th"))
    );
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest("td, th")) return;

    const cells = getCells();
    let rowIdx = -1;
    let colIdx = -1;

    for (let r = 0; r < cells.length; r++) {
      const c = cells[r].indexOf(target.closest("td, th") as HTMLElement);
      if (c !== -1) {
        rowIdx = r;
        colIdx = c;
        break;
      }
    }

    if (rowIdx === -1) return;

    let nextRow = rowIdx;
    let nextCol = colIdx;

    switch (e.key) {
      case "ArrowUp":
        nextRow = Math.max(0, rowIdx - 1);
        break;
      case "ArrowDown":
        nextRow = Math.min(cells.length - 1, rowIdx + 1);
        break;
      case "ArrowLeft":
        nextCol = Math.max(0, colIdx - 1);
        break;
      case "ArrowRight":
        nextCol = Math.min((cells[rowIdx]?.length ?? 1) - 1, colIdx + 1);
        break;
      case "Home":
        nextCol = 0;
        break;
      case "End":
        nextCol = (cells[rowIdx]?.length ?? 1) - 1;
        break;
      default:
        return;
    }

    e.preventDefault();
    const cell = cells[nextRow]?.[nextCol];
    if (cell) {
      cell.setAttribute("tabindex", "0");
      cell.focus();
      // Remove tabindex from previous cell
      if (nextRow !== rowIdx || nextCol !== colIdx) {
        const prev = cells[rowIdx]?.[colIdx];
        prev?.setAttribute("tabindex", "-1");
      }
    }
  };

  tableElement.addEventListener("keydown", handleKeyDown);

  // Make first cell focusable
  const firstCell = tableElement.querySelector<HTMLElement>("td, th");
  firstCell?.setAttribute("tabindex", "0");

  return () => {
    tableElement.removeEventListener("keydown", handleKeyDown);
  };
}
