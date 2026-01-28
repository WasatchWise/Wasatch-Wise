import type { ReactNode } from "react";
import { Providers } from "@/components/Providers";

export default function QuizLayout({ children }: { children: ReactNode }) {
  return <Providers>{children}</Providers>;
}
