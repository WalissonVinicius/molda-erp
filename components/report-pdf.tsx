import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import { formatCell, isColunaNumerica } from "@/lib/format";

const C = {
  accent: "#5B58F6",
  ink: "#1b1b22",
  muted: "#6b6b73",
  line: "#e6e6ea",
  soft: "#f4f4f7",
};

const pretty = (s: string) => s.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());

const styles = StyleSheet.create({
  page: { paddingHorizontal: 40, paddingTop: 44, paddingBottom: 56, fontSize: 10, color: C.ink, fontFamily: "Helvetica" },
  eyebrow: { fontSize: 8, color: C.accent, letterSpacing: 1.5, marginBottom: 6, fontFamily: "Helvetica-Bold" },
  title: { fontSize: 20, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  desc: { fontSize: 10, color: C.muted, marginBottom: 20 },
  thead: { flexDirection: "row", backgroundColor: C.accent },
  th: { flex: 1, paddingVertical: 7, paddingHorizontal: 8, fontSize: 9, color: "#ffffff", fontFamily: "Helvetica-Bold" },
  tr: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: C.line },
  trAlt: { backgroundColor: C.soft },
  td: { flex: 1, paddingVertical: 6, paddingHorizontal: 8, fontSize: 9 },
  right: { textAlign: "right" },
  footer: {
    position: "absolute",
    left: 40,
    right: 40,
    bottom: 26,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: C.line,
    paddingTop: 8,
    fontSize: 8,
    color: C.muted,
  },
});

type Args = { titulo: string; descricao: string; cols: string[]; rows: unknown[][] };

function RelatorioDoc({ titulo, descricao, cols, rows }: Args) {
  return (
    <Document title={titulo} author="Molda ERP" creator="Molda ERP" producer="Molda ERP">
      <Page size="A4" style={styles.page}>
        <Text style={styles.eyebrow}>MOLDA ERP · RELATÓRIO</Text>
        <Text style={styles.title}>{titulo}</Text>
        <Text style={styles.desc}>{descricao}</Text>

        <View style={styles.thead} fixed>
          {cols.map((c) => (
            <Text key={c} style={isColunaNumerica(c) ? [styles.th, styles.right] : styles.th}>
              {pretty(c)}
            </Text>
          ))}
        </View>

        {rows.map((r, i) => (
          <View key={i} style={i % 2 === 1 ? [styles.tr, styles.trAlt] : styles.tr} wrap={false}>
            {cols.map((c, ci) => (
              <Text key={c} style={isColunaNumerica(c) ? [styles.td, styles.right] : styles.td}>
                {formatCell(c, r[ci])}
              </Text>
            ))}
          </View>
        ))}

        <View style={styles.footer} fixed>
          <Text>Molda — agência digital · Sinop/MT</Text>
          <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}

export async function gerarRelatorioPdf(args: Args): Promise<Buffer> {
  return renderToBuffer(<RelatorioDoc {...args} />);
}
