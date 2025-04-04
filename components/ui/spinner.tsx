import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <div className={cn("animate-spin", className)}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size === "sm" ? "16" : size === "md" ? "24" : "32"}
        height={size === "sm" ? "16" : size === "md" ? "24" : "32"}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  );
}