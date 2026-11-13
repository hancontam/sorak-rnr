import { TextClassContext } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { Slot } from '@rn-primitives/slot';
import { cva } from 'class-variance-authority';
import { Platform, View } from 'react-native';
const badgeVariants = cva(
  cn(
    'group shrink-0 flex-row items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2 py-0.5',
    Platform.select({
      web: 'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive w-fit whitespace-nowrap transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 [&>svg]:pointer-events-none [&>svg]:size-3',
    })
  ),
  {
    variants: {
      variant: {
        default: cn(
          'border-transparent bg-primary',
          Platform.select({
            web: '[a&]:hover:bg-primary/90',
          })
        ),
        secondary: cn(
          'border-transparent bg-secondary',
          Platform.select({
            web: '[a&]:hover:bg-secondary/90',
          })
        ),
        // Nhãn vai trò/mã tài khoản: nền cobalt đặc như badge Verified của showcase.
        brand: 'bg-brand',
        destructive: cn(
          'border-transparent bg-destructive',
          Platform.select({
            web: '[a&]:hover:bg-destructive/90',
          })
        ),
        outline: cn(
          'border-border',
          Platform.select({
            web: '[a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
          })
        ),
        // Chip mã/trạng thái phụ dạng mono (ví dụ OFF trong showcase).
        code: 'rounded-md bg-muted px-1.5',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);
const badgeTextVariants = cva('text-2xs font-semibold', {
  variants: {
    variant: {
      default: 'text-primary-foreground',
      secondary: 'text-secondary-foreground',
      brand: 'text-brand-foreground',
      destructive: 'text-white',
      outline: 'text-foreground',
      code: 'font-mono font-medium text-muted-foreground',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});
function Badge({ className, variant, asChild, ...props }) {
  const Component = asChild ? Slot : View;
  return (
    <TextClassContext.Provider
      value={badgeTextVariants({
        variant,
      })}>
      <Component
        className={cn(
          badgeVariants({
            variant,
          }),
          className
        )}
        {...props}
      />
    </TextClassContext.Provider>
  );
}
export { Badge, badgeTextVariants, badgeVariants };
