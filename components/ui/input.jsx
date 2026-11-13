import { fontStyle } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import { Platform, TextInput } from 'react-native';
function Input({ className, style, ...props }) {
  return (
    <TextInput
      style={[fontStyle(className), style]}
      className={cn(
        'flex h-10 w-full min-w-0 flex-row items-center rounded-lg border border-input bg-background px-3 py-1 text-xs leading-4 text-foreground dark:bg-input/30',
        props.editable === false &&
          cn(
            'opacity-50',
            Platform.select({
              web: 'disabled:pointer-events-none disabled:cursor-not-allowed',
            })
          ),
        Platform.select({
          web: cn(
            'outline-none transition-[color,box-shadow] selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground',
            'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
            'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive'
          ),
          native: 'placeholder:text-muted-foreground/70',
        }),
        className
      )}
      {...props}
    />
  );
}
export { Input };
