// Exportación de reportes a PDF y Excel.
//
// Requiere instalar en el frontend (no vienen con el proyecto):
//   npm install jspdf jspdf-autotable xlsx
//
// `columnas` es siempre un arreglo [{ header: 'Texto visible', key: 'campo_en_la_fila' }]
// y `filas` es el arreglo de objetos ya cargado en el reporte (sin paginar).

export async function exportarExcel({ columnas, filas, nombreArchivo, nombreHoja = 'Reporte' }) {
  const XLSX = await import('xlsx');

  const datos = filas.map((fila) => {
    const obj = {};
    columnas.forEach((col) => { obj[col.header] = fila[col.key] ?? ''; });
    return obj;
  });

  const hoja = XLSX.utils.json_to_sheet(datos);
  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hoja, nombreHoja);
  XLSX.writeFile(libro, `${nombreArchivo}.xlsx`);
}

export async function exportarPDF({ titulo, subtitulo, columnas, filas, nombreArchivo }) {
  const { jsPDF } = await import('jspdf');
  await import('jspdf-autotable');

  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text(titulo, 14, 16);
  if (subtitulo) {
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(subtitulo, 14, 22);
  }

  doc.autoTable({
    startY: subtitulo ? 28 : 22,
    head: [columnas.map((c) => c.header)],
    body: filas.map((fila) => columnas.map((c) => {
      const valor = fila[c.key];
      return valor === null || valor === undefined ? '—' : String(valor);
    })),
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [37, 99, 235], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 247, 250] },
  });

  doc.save(`${nombreArchivo}.pdf`);
}
