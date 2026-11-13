import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import Build from "@/components/ui/build";

type Props = { to: "/" | "/play"; hash?: string; children: ReactNode };

// "← Back …" at the top of a page, drawn in as the page loads.
const BackLink = ({ to, hash, children }: Props) => (
  <Build label="Link · back" immediate delay={0.2} className="w-fit">
    <Link
      to={to}
      hash={hash}
      className="inline-flex items-center gap-2 font-mono text-xs text-fog transition-colors hover:text-bone"
    >
      <ArrowLeft aria-hidden className="size-3.5" />
      {children}
    </Link>
  </Build>
);

export default BackLink;
