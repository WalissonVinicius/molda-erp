import { cn } from "@/components/ui";

// Botão de ação dentro de um <form> que chama uma server action.
export function AcaoBotao({
  action,
  name,
  value,
  children,
  variant = "primary",
}: {
  action: (formData: FormData) => void;
  name: string;
  value: string | number;
  children: React.ReactNode;
  variant?: "primary" | "ghost";
}) {
  return (
    <form action={action} className="inline">
      <input type="hidden" name={name} value={String(value)} />
      <button
        type="submit"
        className={cn(
          "rounded-md px-3 py-1 text-xs font-medium transition-colors",
          variant === "primary"
            ? "bg-accent text-white hover:bg-accent-hover"
            : "border border-border text-muted hover:bg-elevated hover:text-foreground"
        )}
      >
        {children}
      </button>
    </form>
  );
}
