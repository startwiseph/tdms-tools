import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-bc-1/30 bg-white px-3 py-2 text-sm text-bc-1 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-bc-1 placeholder:text-bc-1/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bc-1/50 focus-visible:border-bc-1 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
