import { buttonTextVariants, buttonVariants } from '@/components/ui/button';
import { NativeOnlyAnimatedView } from '@/components/ui/native-only-animated-view';
import { TextClassContext } from '@/components/ui/text';
import { fontStyle } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import * as AlertDialogPrimitive from '@rn-primitives/alert-dialog';
import * as React from 'react';
import { Platform, View } from 'react-native';
import { FadeIn, FadeOut, ReduceMotion } from 'react-native-reanimated';
import { FullWindowOverlay as RNFullWindowOverlay } from 'react-native-screens';
const AlertDialog = AlertDialogPrimitive.Root;
const AlertDialogTrigger = AlertDialogPrimitive.Trigger;
const AlertDialogPortal = AlertDialogPrimitive.Portal;
const FullWindowOverlay = Platform.OS === 'ios' ? RNFullWindowOverlay : React.Fragment;
function AlertDialogOverlay({ className, children, ...props }) {
  return (
    <FullWindowOverlay>
      <AlertDialogPrimitive.Overlay
        className={cn(
          'absolute bottom-0 left-0 right-0 top-0 z-50 flex items-center justify-center bg-black/50 p-2',
          Platform.select({
            web: 'fixed animate-in fade-in-0',
          }),
          className
        )}
        {...props}
        asChild={Platform.OS !== 'web'}>
        <NativeOnlyAnimatedView
          entering={FadeIn.duration(200).delay(50).reduceMotion(ReduceMotion.System)}
          exiting={FadeOut.duration(150).reduceMotion(ReduceMotion.System)}
          as="Pressable">
          <>{children}</>
        </NativeOnlyAnimatedView>
      </AlertDialogPrimitive.Overlay>
    </FullWindowOverlay>
  );
}
function AlertDialogContent({ className, portalHost, ...props }) {
  return (
    <AlertDialogPortal hostName={portalHost}>
      <AlertDialogOverlay>
        <AlertDialogPrimitive.Content
          className={cn(
            'z-50 flex w-full max-w-[calc(100%-2.5rem)] flex-col gap-4 rounded-2xl border border-border bg-popover p-5 shadow-xl shadow-black/20 sm:max-w-lg',
            Platform.select({
              web: 'duration-200 animate-in fade-in-0 zoom-in-95',
            }),
            className
          )}
          {...props}
        />
      </AlertDialogOverlay>
    </AlertDialogPortal>
  );
}
function AlertDialogHeader({ className, ...props }) {
  return (
    <TextClassContext.Provider value="text-left">
      <View className={cn('flex flex-col gap-1.5', className)} {...props} />
    </TextClassContext.Provider>
  );
}
function AlertDialogFooter({ className, ...props }) {
  return <View className={cn('flex flex-row justify-end gap-2 pt-1', className)} {...props} />;
}
function AlertDialogTitle({ className, style, ...props }) {
  const merged = cn('text-sm font-semibold text-foreground', className);
  return (
    <AlertDialogPrimitive.Title className={merged} style={[fontStyle(merged), style]} {...props} />
  );
}
function AlertDialogDescription({ className, style, ...props }) {
  const merged = cn('text-xs leading-5 text-muted-foreground', className);
  return (
    <AlertDialogPrimitive.Description
      className={merged}
      style={[fontStyle(merged), style]}
      {...props}
    />
  );
}
// `variant` như Button (ví dụ destructive cho thao tác xóa/hủy); không truyền lớp nút qua className.
function AlertDialogAction({ className, variant, ...props }) {
  return (
    <TextClassContext.Provider
      value={buttonTextVariants({
        className,
        variant,
      })}>
      <AlertDialogPrimitive.Action
        className={cn(buttonVariants({ variant }), className)}
        {...props}
      />
    </TextClassContext.Provider>
  );
}
function AlertDialogCancel({ className, ...props }) {
  return (
    <TextClassContext.Provider
      value={buttonTextVariants({
        className,
        variant: 'outline',
      })}>
      <AlertDialogPrimitive.Cancel
        className={cn(
          buttonVariants({
            variant: 'outline',
          }),
          className
        )}
        {...props}
      />
    </TextClassContext.Provider>
  );
}
export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
};
