const DialogOverlay = React.forwardRef<...>((props, ref) => (
    <DialogPrimitive.Overlay
      ref={ref}
      className={cn(
        "fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm",
        props.className
      )}
      {...props}
    />
  ));
  
  const DialogContent = React.forwardRef<...>((props, ref) => (
    <DialogPrimitive.Portal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed left-[50%] top-[50%] z-[1000] w-full max-w-lg translate-x-[-50%] translate-y-[-50%] ...",
          props.className
        )}
        {...props}
      />
    </DialogPrimitive.Portal>
  ));
  