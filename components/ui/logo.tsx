"use client";

import { useTheme } from "next-themes";
import Image from "next/image";

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export function Logo({ className, width = 150, height = 40 }: LogoProps) {
  const { theme } = useTheme();
  
  return (
    <div className={className}>
      {theme === "dark" ? (
        <Image
          src="/images/fairgradewhite.svg"
          alt="FairGrade Logo"
          width={width}
          height={height}
          priority
        />
      ) : (
        <Image
          src="/images/fairgrade.svg"
          alt="FairGrade Logo"
          width={width}
          height={height}
          priority
        />
      )}
    </div>
  );
} 