import { Text, TextClassContext } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { View } from 'react-native';
function Card({ className, ...props }) {
  return (
    <TextClassContext.Provider value="text-card-foreground">
      <View
        className={cn(
          'flex flex-col gap-4 rounded-2xl border border-border bg-card py-4 shadow-sm shadow-black/5',
          className
        )}
        {...props}
      />
    </TextClassContext.Provider>
  );
}
function CardHeader({ className, ...props }) {
  return <View className={cn('flex flex-col gap-1 px-4', className)} {...props} />;
}
function CardTitle({ className, ref, ...props }) {
  return (
    <Text
      ref={ref}
      role="heading"
      aria-level={3}
      className={cn('text-sm font-semibold leading-5', className)}
      {...props}
    />
  );
}
function CardDescription({ className, ...props }) {
  return <Text className={cn('text-xs leading-5 text-muted-foreground', className)} {...props} />;
}
function CardContent({ className, ...props }) {
  return <View className={cn('px-4', className)} {...props} />;
}
function CardFooter({ className, ...props }) {
  return <View className={cn('flex flex-row items-center px-4', className)} {...props} />;
}
export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };
