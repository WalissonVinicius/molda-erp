import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fixa a raiz do projeto (existe outro lockfile acima na árvore de pastas).
  turbopack: { root: import.meta.dirname },
  // Esconde o selo de desenvolvimento do Next.
  devIndicators: false,
  // O driver libSQL tem binário nativo: não deve ser empacotado pelo bundler.
  serverExternalPackages: ["@libsql/client", "libsql", "@react-pdf/renderer"],
  // Garante que os arquivos .sql dos relatórios sejam incluídos no deploy.
  outputFileTracingIncludes: {
    "/**": ["./db/molda.db"],
    "/relatorios": ["./db/reports/**"],
    "/relatorios/[id]/imprimir": ["./db/reports/**"],
    "/api/relatorios/[id]": ["./db/reports/**"],
  },
};

export default nextConfig;
