"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { useFormStatus } from "react-dom";
import { ArrowUpRight, ChevronDown, LogIn, LogOut, ShieldCheck, UserRound } from "lucide-react";
import { logoutAction } from "@/lib/auth/actions";

export type AccountMenuProps = {
  mode: "demo" | "connected";
  displayName: string | null;
  email: string | null;
  role: "student" | "admin" | null;
};

function SignOutItem({ tabIndex, onFocus }: { tabIndex: number; onFocus: () => void }) {
  const { pending } = useFormStatus();
  return (
    <button className="account-menu-item account-menu-signout" type="submit" role="menuitem"
      tabIndex={tabIndex} onFocus={onFocus} disabled={pending} aria-busy={pending}>
      <LogOut size={17} strokeWidth={1.7} aria-hidden="true" />
      <span aria-live="polite">{pending ? "Signing out…" : "Sign Out"}</span>
    </button>
  );
}

export function AccountMenu({ mode, displayName, email, role }: AccountMenuProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const connected = mode === "connected";
  // This role comes from the server's user_roles lookup, never user metadata.
  const isAdmin = connected && role === "admin";
  const name = connected ? displayName?.trim() || "Your account" : "Demo workspace";
  const itemCount = isAdmin ? 3 : 2;
  const lastIndex = itemCount - 1;

  useEffect(() => {
    if (open) menu.current?.querySelectorAll<HTMLElement>('[role="menuitem"]')[activeIndex]?.focus();
  }, [open, activeIndex, itemCount]);

  useEffect(() => {
    if (!open) return;
    const dismissOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", dismissOutside, true);
    return () => document.removeEventListener("pointerdown", dismissOutside, true);
  }, [open]);

  function openMenu(index = 0) {
    setActiveIndex(index);
    setOpen(true);
  }

  function handleMenuKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === " " && event.target instanceof HTMLAnchorElement && !event.ctrlKey && !event.altKey && !event.metaKey) {
      event.preventDefault();
      event.target.click();
      return;
    }
    if (event.key === "Tab") {
      // Leave the menu in the normal document tab order, without a focus trap.
      setOpen(false);
      trigger.current?.focus({ preventScroll: true });
      return;
    }
    const nextIndex = event.key === "ArrowDown" ? (activeIndex + 1) % itemCount
      : event.key === "ArrowUp" ? (activeIndex + itemCount - 1) % itemCount
      : event.key === "Home" ? 0 : event.key === "End" ? lastIndex : null;
    if (nextIndex !== null) {
      event.preventDefault();
      setActiveIndex(nextIndex);
    } else if (event.key.length === 1 && event.key !== " " && !event.ctrlKey && !event.altKey && !event.metaKey) {
      const items = Array.from(menu.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
      const match = Array.from({ length: itemCount }, (_, offset) => (activeIndex + offset + 1) % itemCount)
        .find(index => items[index]?.textContent?.trim().toLocaleLowerCase().startsWith(event.key.toLocaleLowerCase()));
      if (match !== undefined) {
        event.preventDefault();
        setActiveIndex(match);
      }
    }
  }

  return (
    <div className="account-menu" ref={root}
      onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}
      onKeyDown={event => {
        if (open && event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          setOpen(false);
          trigger.current?.focus({ preventScroll: true });
        }
      }}>
      <button className="account-button" type="button" ref={trigger}
        aria-label={`${name}, account menu`} aria-haspopup="menu" aria-expanded={open} aria-controls={menuId}
        onClick={() => { if (open) setOpen(false); else openMenu(); }}
        onKeyDown={event => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            openMenu(event.key === "ArrowUp" ? lastIndex : 0);
          }
        }}>
        <span className="avatar"><UserRound size={18} aria-hidden="true" /></span>
        <span className="account-name">{name}</span>
        <ChevronDown className="account-chevron" size={14} aria-hidden="true" />
      </button>
      <div className="account-menu-panel" hidden={!open}>
        <div className="account-menu-identity">
          <p className="account-menu-eyebrow">{connected ? "YOUR ACCOUNT" : "WORKSPACE PREVIEW"}</p>
          <p className="account-menu-display-name">{name}</p>
          <p className="account-menu-email">{connected ? email || "Signed-in account" : "Explore without an account"}</p>
          {isAdmin && <span className="account-menu-role"><ShieldCheck size={13} aria-hidden="true" /> Administrator</span>}
        </div>
        <div className="account-menu-actions" id={menuId} role="menu" aria-label="Account actions" ref={menu} onKeyDown={handleMenuKeyDown}>
          <Link className="account-menu-item" href="/profile" role="menuitem" tabIndex={activeIndex === 0 ? 0 : -1}
            onFocus={() => setActiveIndex(0)} onClick={() => setOpen(false)}>
            <UserRound size={17} strokeWidth={1.7} aria-hidden="true" /><span>Profile &amp; Goals</span><ArrowUpRight className="account-menu-arrow" size={14} aria-hidden="true" />
          </Link>
          {isAdmin && <Link className="account-menu-item" href="/admin" role="menuitem" tabIndex={activeIndex === 1 ? 0 : -1}
            onFocus={() => setActiveIndex(1)} onClick={() => setOpen(false)}>
            <ShieldCheck size={17} strokeWidth={1.7} aria-hidden="true" /><span>Administration</span><ArrowUpRight className="account-menu-arrow" size={14} aria-hidden="true" />
          </Link>}
          <div className="account-menu-divider" role="separator" />
          {connected ? <form action={logoutAction} role="none">
            <SignOutItem tabIndex={activeIndex === lastIndex ? 0 : -1} onFocus={() => setActiveIndex(lastIndex)} />
          </form> : <Link className="account-menu-item" href="/login" role="menuitem" tabIndex={activeIndex === lastIndex ? 0 : -1}
            onFocus={() => setActiveIndex(lastIndex)} onClick={() => setOpen(false)}>
            <LogIn size={17} strokeWidth={1.7} aria-hidden="true" /><span>Sign in</span>
          </Link>}
        </div>
      </div>
    </div>
  );
}
