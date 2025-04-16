"use client";

import { useTheme } from "next-themes";
import Image from "next/image";

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
  forceWhite?: boolean;
}

export function Logo({ className, width = 150, height = 40, forceWhite = false }: LogoProps) {
  const { theme } = useTheme();
  
  return (
    <div className={className}>
      {(theme === "dark" || forceWhite) ? (
        <Image
          src="/fairgradewhite.png"
          alt="FairGrade Logo"
          width={width}
          height={height}
          priority
        />
      ) : (
        <Image
          src="/fairgrade.png"
          alt="FairGrade Logo"
          width={width}
          height={height}
          priority
        />
      )}
    </div>
  );
} 