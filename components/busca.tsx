"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

export function Busca({ placeholder = "Buscar…" }: { placeholder?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      <input
        defaultValue={sp.get("q") ?? ""}
        placeholder={placeholder}
        onChange={(e) => {
          const params = new URLSearchParams(Array.from(sp.entries()));
          const v = e.target.value;
          if (v) params.set("q", v);
          else params.delete("q");
          router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        }}
        className="w-full rounded-lg border border-border bg-elevated py-2 pl-9 pr-3 text-sm outline-none focus:border-accent sm:w-60"
      />
    </div>
  );
}
