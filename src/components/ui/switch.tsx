import * as React from 'react'
import { cn } from '@/lib/utils'

export interface SwitchProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  checked: boolean
  onCheckedChange?: (checked: boolean) => void
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, checked, onCheckedChange, disabled, onClick, ...props }, ref) => {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        ref={ref}
        onClick={(e) => {
          onClick?.(e)
          onCheckedChange?.(!checked)
        }}
        className={cn(
          'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 select-none',
          checked
            ? 'bg-amber-500 shadow-xs shadow-amber-500/20'
            : 'bg-stone-800 border border-stone-700/70 hover:bg-stone-700/80',
          className
        )}
        {...props}
      >
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute top-0.5 h-4 w-4 rounded-full shadow-md transition-transform duration-200 ease-in-out',
            checked
              ? 'translate-x-[18px] bg-stone-950'
              : 'translate-x-[2px] bg-stone-300'
          )}
        />
      </button>
    )
  }
)
Switch.displayName = 'Switch'
