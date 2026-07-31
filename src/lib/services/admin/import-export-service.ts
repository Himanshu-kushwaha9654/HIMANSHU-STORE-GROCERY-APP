import { Product } from "@/lib/enterprise-data";

export const ImportExportService = {
  
  /**
   * Generates a CSV string from an array of products
   */
  exportProductsToCSV(products: Product[]): string {
    const headers = [
      "ID",
      "Name",
      "Slug",
      "Description",
      "Category ID",
      "Brand ID",
      "SKU",
      "Barcode",
      "Price",
      "Compare At",
      "Discount",
      "Stock",
      "Weight",
      "Unit",
      "Status",
      "Visibility"
    ];

    const rows = products.map(p => [
      p.id,
      `"${(p.name || '').replace(/"/g, '""')}"`,
      p.slug,
      `"${(p.description || '').replace(/"/g, '""')}"`,
      p.categoryId,
      p.brandId,
      p.sku || "",
      p.barcode || "",
      p.price,
      p.compareAt || "",
      p.discount,
      p.stockQty,
      p.weight || "",
      p.unit || "",
      p.status || "",
      p.visibility || ""
    ]);

    return [
      headers.join(","),
      ...rows.map(r => r.join(","))
    ].join("\n");
  },

  /**
   * Triggers a download of the provided CSV string
   */
  downloadCSV(csvString: string, filename: string = "products_export.csv") {
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  /**
   * Reads a file and returns a Promise with its text content
   */
  async readCSVFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  },

  /**
   * Very basic CSV parser. Does not handle commas inside quotes perfectly,
   * but works for simple flat structures.
   */
  parseCSVToProducts(csvString: string): Partial<Product>[] {
    const lines = csvString.split("\n").filter(l => l.trim().length > 0);
    if (lines.length <= 1) return [];

    const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
    const products: Partial<Product>[] = [];

    for (let i = 1; i < lines.length; i++) {
      // Basic split. In a real app, use PapaParse or similar library
      const row = lines[i].split(",");
      if (row.length < headers.length) continue;

      const p: any = {};
      headers.forEach((header, index) => {
        const val = row[index].replace(/^"|"$/g, '').trim();
        
        switch (header) {
          case 'name': p.name = val; break;
          case 'slug': p.slug = val; break;
          case 'description': p.description = val; break;
          case 'category id': p.categoryId = val; break;
          case 'brand id': p.brandId = val; break;
          case 'sku': p.sku = val; break;
          case 'barcode': p.barcode = val; break;
          case 'price': p.price = parseFloat(val) || 0; break;
          case 'compare at': p.compareAt = parseFloat(val) || null; break;
          case 'discount': p.discount = parseFloat(val) || 0; break;
          case 'stock': p.stockQty = parseInt(val, 10) || 0; break;
          case 'weight': p.weight = val; break;
          case 'unit': p.unit = val; break;
          case 'status': p.status = val as any; break;
          case 'visibility': p.visibility = val as any; break;
        }
      });
      
      if (p.name) {
        products.push(p as Partial<Product>);
      }
    }
    return products;
  }
};
