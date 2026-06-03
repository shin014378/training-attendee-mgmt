import React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const sectionLabelVariants = cva(
  "font-semibold text-muted-foreground",
  {
    variants: {
      tone: {
        default: "",
        sidebar: "text-sidebar-foreground/70",
      },
      size: {
        default: "text-sm uppercase tracking-wide",
        compact: "text-xs tracking-normal",
      },
    },
    defaultVariants: {
      tone: "default",
      size: "default",
    },
  },
);

function SectionLabel({
  className,
  tone = "default",
  size = "default",
  ...props
}: React.ComponentProps<"h2"> & VariantProps<typeof sectionLabelVariants>) {
  return (
    <h2
      className={cn(sectionLabelVariants({ tone, size }), className)}
      {...props}
    />
  );
}

export { SectionLabel, sectionLabelVariants };
