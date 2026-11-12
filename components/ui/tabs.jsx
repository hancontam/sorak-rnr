import { TextClassContext } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import * as TabsPrimitive from '@rn-primitives/tabs';
import { Platform } from 'react-native';
function Tabs({ className, ...props }) {
  return <TabsPrimitive.Root className={cn('flex flex-col gap-2', className)} {...props} />;
}
function TabsList({ className, ...props }) {
  return (
    <TabsPrimitive.List
      className={cn(
        'flex h-9 flex-row items-center justify-center rounded-xl border border-border/60 bg-muted p-1 dark:bg-card',
        Platform.select({
          web: 'inline-flex w-fit',
          native: 'mr-auto',
        }),
        className
      )}
      {...props}
    />
  );
}
function TabsTrigger({ className, ...props }) {
  const { value } = TabsPrimitive.useRootContext();
  return (
    <TextClassContext.Provider
      value={cn(
        'text-xs font-medium text-muted-foreground',
        value === props.value && 'font-semibold text-foreground'
      )}>
      <TabsPrimitive.Trigger
        className={cn(
          'flex h-full flex-row items-center justify-center gap-1.5 rounded-lg px-3 shadow-none shadow-black/5',
          Platform.select({
            web: 'inline-flex cursor-default whitespace-nowrap transition-[color,box-shadow] focus-visible:border-ring focus-visible:outline-1 focus-visible:outline-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0',
          }),
          props.disabled && 'opacity-50',
          props.value === value && 'bg-background shadow-sm dark:bg-muted',
          className
        )}
        {...props}
      />
    </TextClassContext.Provider>
  );
}
function TabsContent({ className, ...props }) {
  return (
    <TabsPrimitive.Content
      className={cn(
        Platform.select({
          web: 'flex-1 outline-none',
        }),
        className
      )}
      {...props}
    />
  );
}
export { Tabs, TabsContent, TabsList, TabsTrigger };
