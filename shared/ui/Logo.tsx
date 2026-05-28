import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  alt?: string;
}

export function Logo({ className, alt = "wakanta.pl" }: LogoProps) {
  return (
    <>
      <img
        src="/logo-wakanta.light.png"
        alt={alt}
        className={cn("block dark:hidden object-contain", className)}
      />
      <img
        src="/logo-wakanta.dark.png"
        alt={alt}
        className={cn("hidden dark:block object-contain", className)}
      />
    </>
  );
}
