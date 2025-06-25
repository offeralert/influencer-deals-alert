
import { TooltipProvider } from "@/components/ui/tooltip";
import { ReactNode } from "react";

interface TooltipWrapperProps {
  children: ReactNode;
}

export const TooltipWrapper = ({ children }: TooltipWrapperProps) => {
  return <TooltipProvider>{children}</TooltipProvider>;
};
