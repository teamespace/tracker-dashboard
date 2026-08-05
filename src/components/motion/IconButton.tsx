import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';
import { useState } from 'react';
import { useReducedMotion } from 'motion/react';

type IconButtonElement = 'span' | 'button';

export type IconButtonState = {
  hovered: boolean;
  focused: boolean;
  pressed: boolean;
  reducedMotion: boolean;
};

export type IconButtonProps<T extends IconButtonElement = 'span'> = {
  as?: T;
  children: ReactNode | ((state: IconButtonState) => ReactNode);
} & Omit<ComponentPropsWithoutRef<T>, 'children' | 'className'> & {
  className?: string;
};

export function IconButton<T extends IconButtonElement = 'span'>({
  as,
  children,
  className,
  onBlur,
  onFocus,
  onKeyDown,
  onKeyUp,
  onPointerCancel,
  onPointerDown,
  onPointerEnter,
  onPointerLeave,
  onPointerUp,
  ...props
}: IconButtonProps<T>) {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pressed, setPressed] = useState(false);
  const state = { hovered, focused, pressed, reducedMotion: prefersReducedMotion };
  const Component = (as ?? 'span') as ElementType;

  return (
    <Component
      {...props}
      className={className}
      data-hovered={hovered || undefined}
      data-focused={focused || undefined}
      data-pressed={pressed || undefined}
      data-reduced-motion={prefersReducedMotion || undefined}
      onBlur={(event: FocusEvent) => {
        setFocused(false);
        setPressed(false);
        onBlur?.(event as never);
      }}
      onFocus={(event: FocusEvent) => {
        setFocused(true);
        onFocus?.(event as never);
      }}
      onKeyDown={(event: KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') setPressed(true);
        onKeyDown?.(event as never);
      }}
      onKeyUp={(event: KeyboardEvent) => {
        setPressed(false);
        onKeyUp?.(event as never);
      }}
      onPointerCancel={(event: PointerEvent) => {
        setPressed(false);
        onPointerCancel?.(event as never);
      }}
      onPointerDown={(event: PointerEvent) => {
        setPressed(true);
        onPointerDown?.(event as never);
      }}
      onPointerEnter={(event: PointerEvent) => {
        setHovered(true);
        onPointerEnter?.(event as never);
      }}
      onPointerLeave={(event: PointerEvent) => {
        setHovered(false);
        setPressed(false);
        onPointerLeave?.(event as never);
      }}
      onPointerUp={(event: PointerEvent) => {
        setPressed(false);
        onPointerUp?.(event as never);
      }}
    >
      {typeof children === 'function' ? children(state) : children}
    </Component>
  );
}
