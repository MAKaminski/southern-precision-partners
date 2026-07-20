"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "sep-sidebar-open";
const CHANGE_EVENT = "sep-sidebar-open-change";

function read(): boolean {
  return window.localStorage.getItem(STORAGE_KEY) !== "0";
}

function write(open: boolean) {
  window.localStorage.setItem(STORAGE_KEY, open ? "1" : "0");
  // `storage` only fires in *other* tabs; broadcast locally too so this tab's
  // subscribers (the toggle button, the padded content wrapper) re-render.
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

// Server/first-paint snapshot: open by default, matched on the client until
// the real localStorage value is read post-hydration — avoids a hydration
// mismatch without ever calling setState from inside an effect.
function getServerSnapshot() {
  return true;
}

/**
 * Sidebar open/closed state, persisted in localStorage and shared across any
 * component that calls this hook (toggle button, panel, content padding).
 */
export function useSidebarOpen(): [boolean, (next: boolean | ((prev: boolean) => boolean)) => void] {
  const open = useSyncExternalStore(subscribe, read, getServerSnapshot);

  const setOpen = useCallback((next: boolean | ((prev: boolean) => boolean)) => {
    const resolved = typeof next === "function" ? next(read()) : next;
    write(resolved);
  }, []);

  return [open, setOpen];
}
