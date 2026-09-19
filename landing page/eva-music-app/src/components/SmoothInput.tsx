"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import React, {
  type ComponentPropsWithoutRef,
  useEffect,
  useRef,
  useState,
} from "react";

import { cn } from "../lib/utils";

const INPUT_TYPE_OPTIONS = [
  { value: "text", label: "Text" },
  { value: "password", label: "Password" },
];

const inputWrapperClassName = cn(
  "relative w-full rounded-2xl p-3.5 transition-all",
  "bg-white/80 backdrop-blur-xl border border-white/90 shadow-sm",
  "hover:border-purple-300 focus-within:border-purple-500 focus-within:ring-4 focus-within:ring-purple-500/15"
);

const inputClassName =
  "w-full bg-transparent outline-none placeholder:text-slate-400 text-slate-900 font-semibold text-sm";

export type InputFieldProps = ComponentPropsWithoutRef<"input"> & {
  wrapperClassName?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
};

export type SmoothInputType = "text" | "password" | "email" | "search";

export type SmoothInputProps = Omit<InputFieldProps, "type"> & {
  type?: SmoothInputType;
  fontSize?: number;
  caretColor?: string;
  springConfig?: {
    stiffness?: number;
    damping?: number;
    mass?: number;
  };
};

const Input = ({ className, wrapperClassName, icon, rightElement, ...props }: InputFieldProps) => {
  return (
    <div className={cn(inputWrapperClassName, "flex items-center gap-2.5", wrapperClassName)}>
      {icon && <div className="text-purple-600 flex-none">{icon}</div>}
      <input className={cn(inputClassName, className)} {...props} />
      {rightElement && <div className="flex-none">{rightElement}</div>}
    </div>
  );
};

const PASSWORD_CHAR = typeof navigator !== "undefined" && navigator.userAgent.match(/firefox|fxios/i)
  ? "\u25CF"
  : "\u2022";

/**
 * SmoothInput with ultra-smooth spring-animated fluid caret
 */
const SmoothInput = ({
  className,
  wrapperClassName,
  value,
  defaultValue,
  onChange,
  onBlur,
  type = "text",
  placeholder,
  style,
  icon,
  rightElement,
  fontSize = 14,
  caretColor = "bg-gradient-to-b from-purple-600 to-indigo-600 shadow-xs shadow-purple-500/50",
  springConfig = {
    stiffness: 500,
    damping: 30,
    mass: 0.5,
  },
  ...props
}: SmoothInputProps) => {
  const [internalValue, setInternalValue] = useState(defaultValue ?? "");
  const caretX = useMotionValue(0);
  const caretOpacity = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const isControlled = value !== undefined;

  const springCaretX = useSpring(
    caretX,
    prefersReducedMotion
      ? { stiffness: 10000, damping: 100, mass: 0.1 }
      : springConfig
  );

  const inputValue = isControlled ? String(value) : internalValue;
  const activeType = type;
  const displayPlaceholder = placeholder ?? "smooth input";

  const syncMeasureSpan = () => {
    const input = inputRef.current;
    const measureSpan = measureRef.current;
    if (!input || !measureSpan) return;

    const styles = window.getComputedStyle(input);
    const isPassword = input.type === "password";

    let resolvedFontSize = styles.fontSize;
    if (
      PASSWORD_CHAR === "\u2022" &&
      isPassword &&
      typeof navigator !== "undefined" &&
      !navigator.userAgent.match(/chrome|chromium|crios/i)
    ) {
      resolvedFontSize = `${parseFloat(resolvedFontSize) + 6.25}px`;
    }

    measureSpan.style.font = `${styles.fontStyle} ${styles.fontWeight} ${resolvedFontSize} ${styles.fontFamily}`;
    measureSpan.style.letterSpacing = styles.letterSpacing;
    measureSpan.style.fontFeatureSettings = styles.fontFeatureSettings;
    measureSpan.style.fontVariationSettings = styles.fontVariationSettings;
  };

  const measurePrefixWidth = (text: string) => {
    const input = inputRef.current;
    const measureSpan = measureRef.current;
    if (!input || !measureSpan) return null;

    syncMeasureSpan();
    measureSpan.textContent = text;

    const paddingLeft =
      parseFloat(window.getComputedStyle(input).paddingLeft) || 0;

    return text.length > 0
      ? measureSpan.offsetWidth + paddingLeft
      : paddingLeft;
  };

  const scrollCaretIntoView = (
    target: HTMLInputElement,
    absoluteWidth: number
  ) => {
    const styles = window.getComputedStyle(target);
    const paddingLeft = parseFloat(styles.paddingLeft) || 0;
    const paddingRight = parseFloat(styles.paddingRight) || 0;
    const maxScroll = Math.max(0, target.scrollWidth - target.clientWidth);
    const visibleRight = target.scrollLeft + target.clientWidth - paddingRight;
    const visibleLeft = target.scrollLeft + paddingLeft;

    if (absoluteWidth > visibleRight) {
      target.scrollLeft = Math.min(
        absoluteWidth - target.clientWidth + paddingRight,
        maxScroll
      );
      return;
    }

    if (absoluteWidth < visibleLeft) {
      target.scrollLeft = Math.max(0, absoluteWidth - paddingLeft);
    }
  };

  const getCaretIndex = (target: HTMLInputElement) => {
    const selectionStart = target.selectionStart ?? 0;
    const selectionEnd = target.selectionEnd ?? 0;

    if (selectionStart === selectionEnd) {
      return selectionStart;
    }

    return target.selectionDirection === "backward"
      ? selectionStart
      : selectionEnd;
  };

  const updateCaretFromInput = (target: HTMLInputElement) => {
    const selectionStart = target.selectionStart ?? 0;
    const selectionEnd = target.selectionEnd ?? 0;
    const hasSelection = selectionStart !== selectionEnd;
    const caretIndex = getCaretIndex(target);
    const isPassword = target.type === "password";
    const textBeforeCaret = isPassword
      ? PASSWORD_CHAR.repeat(caretIndex)
      : target.value.slice(0, caretIndex);

    const absoluteWidth = measurePrefixWidth(textBeforeCaret);
    if (absoluteWidth === null) return;

    scrollCaretIntoView(target, absoluteWidth);

    const styles = window.getComputedStyle(target);
    const paddingLeft = parseFloat(styles.paddingLeft) || 0;
    const paddingRight = parseFloat(styles.paddingRight) || 0;
    const caretPosition = absoluteWidth - target.scrollLeft;
    const minX = paddingLeft;
    const maxX = target.clientWidth - paddingRight;
    const isCaretVisible =
      caretPosition >= minX - 1 && caretPosition <= maxX + 2;

    caretX.set(Math.min(Math.max(caretPosition, minX), maxX));

    if (!isCaretVisible || hasSelection) {
      caretOpacity.set(0);
      return;
    }

    caretOpacity.set(1);
  };

  const updateCaretRef = useRef(updateCaretFromInput);
  updateCaretRef.current = updateCaretFromInput;
  const caretOpacityRef = useRef(caretOpacity);
  caretOpacityRef.current = caretOpacity;

  useEffect(() => {
    const input = inputRef.current;
    if (input && document.activeElement === input) {
      updateCaretRef.current(input);
    }
  }, [inputValue, activeType, fontSize]);

  useEffect(() => {
    const input = inputRef.current;
    const container = containerRef.current;
    if (!input || !container) return;

    const updateCaretIfFocused = () => {
      if (document.activeElement === input) {
        updateCaretRef.current(input);
      }
    };

    const handleSelectionChange = () => {
      if (document.activeElement !== input) return;

      requestAnimationFrame(() => {
        if (document.activeElement === input) {
          updateCaretRef.current(input);
        }
      });
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    document.fonts?.addEventListener?.("loadingdone", updateCaretIfFocused);
    void document.fonts?.ready?.then?.(updateCaretIfFocused);
    input.addEventListener("scroll", updateCaretIfFocused);

    const resizeObserver = new ResizeObserver(updateCaretIfFocused);
    resizeObserver.observe(container);

    updateCaretIfFocused();

    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
      document.fonts?.removeEventListener?.("loadingdone", updateCaretIfFocused);
      input.removeEventListener("scroll", updateCaretIfFocused);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className={cn(inputWrapperClassName, "flex items-center gap-2.5", wrapperClassName)}>
      {icon && <div className="text-purple-600 flex-none">{icon}</div>}
      
      <div
        ref={containerRef}
        className="relative grid grid-cols-1 p-0 flex-1 min-w-0"
        style={{ caretColor: "transparent", fontSize }}
      >
        <input
          {...props}
          ref={inputRef}
          type={activeType}
          placeholder={displayPlaceholder}
          className={cn(
            inputClassName,
            "col-start-1 col-end-2 row-start-1 row-end-2 text-inherit",
            className
          )}
          style={{ ...style, caretColor: "transparent" }}
          value={inputValue}
          onFocus={(e) => {
            caretOpacity.set(1);
            updateCaretRef.current(e.target);
            props.onFocus?.(e);
          }}
          onChange={(e) => {
            if (!isControlled) setInternalValue(e.target.value);
            onChange?.(e);
            requestAnimationFrame(() => {
              updateCaretRef.current(e.target);
            });
          }}
          onBlur={(e) => {
            caretOpacityRef.current.set(0);
            onBlur?.(e);
          }}
          onKeyDown={(e) => {
            requestAnimationFrame(() => {
              if (inputRef.current) updateCaretRef.current(inputRef.current);
            });
            props.onKeyDown?.(e);
          }}
          onKeyUp={(e) => {
            requestAnimationFrame(() => {
              if (inputRef.current) updateCaretRef.current(inputRef.current);
            });
            props.onKeyUp?.(e);
          }}
          onClick={(e) => {
            requestAnimationFrame(() => {
              if (inputRef.current) updateCaretRef.current(inputRef.current);
            });
            props.onClick?.(e);
          }}
        />
        <span
          ref={measureRef}
          aria-hidden
          className="pointer-events-none invisible absolute top-0 left-0 whitespace-pre"
        />
        <motion.div
          className={cn(
            "pointer-events-none col-start-1 col-end-2 row-start-1 row-end-2 h-[1.15em] w-[2px] self-center rounded-full",
            caretColor
          )}
          style={{ x: springCaretX, opacity: caretOpacity }}
        />
      </div>

      {rightElement && <div className="flex-none">{rightElement}</div>}
    </div>
  );
};

const Skiper106 = () => {
  return (
    <div className="bg-[#fcf8ff] text-slate-900 flex h-full w-full flex-col items-center justify-center p-6">
      <div className="-mt-10 mb-8 grid content-start justify-items-center gap-3 text-center">
        <span className="text-xs uppercase tracking-wider font-bold text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
          Smooth Spring Caret Animation
        </span>
        <p className="text-xs text-slate-500">Fluid physics-based cursor motion</p>
      </div>
      <div className="flex w-full flex-col items-center space-y-4 max-w-sm">
        <SmoothInput aria-label="Smooth caret input" placeholder="Type smoothly here..." />
        <Input
          placeholder="Normal input"
          className="text-sm"
          wrapperClassName="w-full"
          aria-label="Normal input"
        />
      </div>
    </div>
  );
};

export { Input, Skiper106, SmoothInput };
