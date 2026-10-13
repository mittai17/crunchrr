"use client";
import * as D from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";
export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  wide = false,
  className = "",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  wide?: boolean;
  className?: string;
}) {
  return (
    <D.Root open={open} onOpenChange={onOpenChange}>
      <D.Portal>
        <D.Overlay className="dialog-overlay" />
        <D.Content className={`dialog-content ${wide ? "dialog-wide" : ""} ${className}`}>
          <div className="dialog-heading">
            <D.Title>{title}</D.Title>
            <D.Close className="icon-button" aria-label="Close">
              <X size={20} />
            </D.Close>
          </div>
          <D.Description className="muted dialog-description">
            {description ||
              "Organize your life, one connected record at a time."}
          </D.Description>
          {children}
        </D.Content>
      </D.Portal>
    </D.Root>
  );
}
