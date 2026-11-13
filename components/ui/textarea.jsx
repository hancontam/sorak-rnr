import { fontStyle } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import { Platform, TextInput } from 'react-native';
function Textarea({
  className,
  style,
  multiline = true,
  numberOfLines = Platform.select({
    web: 2,
    native: 8,
  }),
  // On web, numberOfLines also determines initial height. On native, it determines the maximum height.
  placeholderClassName,
  ...props
}) {
  return (
    <TextInput
      style={[fontStyle(className), style]}
      className={cn(
        'flex min-h-20 w-full flex-row rounded-lg border border-input bg-transparent px-3 py-2 text-xs leading-5 text-foreground dark:bg-input/30',
        Platform.select({
          web: 'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive field-sizing-content resize-y outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed',
        }),
        props.editable === false && 'opacity-50',
        className
      )}
      placeholderClassName={cn('text-muted-foreground', placeholderClassName)}
      multiline={multiline}
      numberOfLines={numberOfLines}
      textAlignVertical="top"
      {...props}
    />
  );
}
export { Textarea };
