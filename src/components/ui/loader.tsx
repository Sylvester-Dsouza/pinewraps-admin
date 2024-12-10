'use client';

import { Loader2 } from "lucide-react";

interface LoaderProps {
  size?: number;
}

export const Loader = ({
  size = 24
}: LoaderProps) => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <Loader2 
        size={size}
        className="animate-spin text-muted-foreground" 
      />
    </div>
  );
};
