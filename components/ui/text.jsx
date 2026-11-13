import { fontStyle } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import { Slot } from '@rn-primitives/slot';
import { cva } from 'class-variance-authority';
import * as React from 'react';
import { Platform, Text as RNText } from 'react-native';
const textVariants = cva(
  cn(
    'text-base text-foreground',
    Platform.select({
      web: 'select-text',
    })
  ),
  {
    variants: {
      variant: {
        default: '',
        h1: cn(
          'text-2xl font-semibold tracking-tight',
          Platform.select({
            web: 'scroll-m-20 text-balance',
          })
        ),
        h2: cn(
          'text-xl font-semibold tracking-tight',
          Platform.select({
            web: 'scroll-m-20 first:mt-0',
          })
        ),
        h3: cn(
          'text-lg font-semibold tracking-tight',
          Platform.select({
            web: 'scroll-m-20',
          })
        ),
        h4: cn(
          'text-sm font-semibold',
          Platform.select({
            web: 'scroll-m-20',
          })
        ),
        p: 'text-xs leading-5',
        blockquote: 'mt-4 border-l-2 pl-3 italic sm:mt-6 sm:pl-6',
        code: cn('relative rounded bg-muted px-1 py-0.5 font-mono text-xs font-medium'),
        lead: 'text-sm text-muted-foreground',
        large: 'text-sm font-semibold',
        small: 'text-2xs font-medium',
        muted: 'text-xs text-muted-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);
const ROLE = {
  h1: 'heading',
  h2: 'heading',
  h3: 'heading',
  h4: 'heading',
  blockquote: Platform.select({
    web: 'blockquote',
  }),
  code: Platform.select({
    web: 'code',
  }),
};
const ARIA_LEVEL = {
  h1: '1',
  h2: '2',
  h3: '3',
  h4: '4',
};
const TextClassContext = React.createContext(undefined);
function Text({ className, asChild = false, variant = 'default', style, ...props }) {
  const textClass = React.useContext(TextClassContext);
  const Component = asChild ? Slot : RNText;
  const merged = cn(
    textVariants({
      variant,
    }),
    textClass,
    className
  );
  return (
    <Component
      className={merged}
      style={[fontStyle(merged), style]}
      role={variant ? ROLE[variant] : undefined}
      aria-level={variant ? ARIA_LEVEL[variant] : undefined}
      {...props}
    />
  );
}
export { Text, TextClassContext };
