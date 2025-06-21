
import jsPDF from 'jspdf';

interface PurchaseItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
}

interface PurchaseForPDF {
  id: string;
  productId: string;
  productName: string;
  supplier: string;
  quantity: number;
  unitPrice: string;
  totalAmount: string;
  date: string;
  status: string;
  notes?: string;
  purchaseOrderId?: string;
  items?: PurchaseItem[];
}

interface SaleForPDF {
  id: string;
  productId: string;
  productName: string;
  customerName?: string;
  quantity: number;
  unitPrice: string;
  totalAmount: string;
  date: string;
  status: string;
  notes?: string;
}
export const generatePInvoicePDF = (purchase: Purchase) => {
  const doc = new jsPDF();

  // Add logo
  doc.addImage(logoBase64, 'PNG', 10, 10, 25, 25);

  // Header
  doc.setFontSize(20);
  doc.text('PURCHASE ORDER', 105, 20, { align: 'center' });

  // Company info
  doc.setFontSize(12);
  doc.text('Nahar Enterprise', 20, 40);
  doc.text('Abdul Kadar market, member bari road,', 20, 50);
  doc.text('National University, gazipur city corporation.', 20, 60);
  doc.text('Phone: 01712014171', 20, 70);

  // Purchase order details
  doc.text(`Purchase Order ID: ${purchase.id}`, 120, 40);
  doc.text(`Date: ${new Date(purchase.date).toLocaleDateString()}`, 120, 50);
  doc.text(`Status: ${purchase.status}`, 120, 60);

  // Supplier info
  doc.text('Supplier:', 20, 90);
  doc.text(purchase.supplier, 20, 100);

  // Table headers
  doc.setFontSize(10);
  doc.text('Product', 20, 120);
  doc.text('Quantity', 80, 120);
  doc.text('Unit Price', 120, 120);
  doc.text('Total', 160, 120);

  // Draw line under headers
  doc.line(20, 125, 190, 125);

  // Product details
  let yPosition = 135; // Start position for product rows
  if (purchase.items && purchase.items.length > 0){
    purchase.items.forEach((item: any) => {
    doc.text(item.productName, 20, yPosition);
    doc.text(item.quantity.toString(), 80, yPosition);
    doc.text(`৳${item.unitPrice}`, 120, yPosition);
    doc.text(`৳${item.totalAmount}`, 160, yPosition);
    yPosition += 10; // Move down for next item
  });
  }
  else{
     // Handle single item (fallback)
    doc.text(purchase.productName, 20, yPosition);
    doc.text(purchase.quantity.toString(), 80, yPosition);
    doc.text(purchase.unitPrice, 120, yPosition);
    doc.text(purchase.totalAmount, 160, yPosition);
    
    yPosition += 20;
  }
  

  // Total section
  doc.line(20, yPosition, 190, yPosition);
  yPosition += 10;
  doc.setFontSize(12);
  doc.text(`Total Amount: ${purchase.totalAmount}`, 120, yPosition);

  // Notes
  if (purchase.notes) {
    yPosition += 20;
    doc.setFontSize(10);
    doc.text('Notes:', 20, yPosition);
    doc.text(purchase.notes, 20, yPosition + 10);
  }

  // Footer
  doc.setFontSize(8);
  doc.text('Purchase Order', 105, 270, { align: 'center' });

  // Save the PDF
  doc.save(`purchase-order-${purchase.id}.pdf`);
};



export const generatePurchaseInvoicePDF = (purchase: PurchaseForPDF) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.text('Purchase Order', 20, 30);
  
  // Add order details
  doc.setFontSize(12);
  doc.text(`Order ID: ${purchase.purchaseOrderId || purchase.id}`, 20, 50);
  doc.text(`Supplier: ${purchase.supplier}`, 20, 60);
  doc.text(`Date: ${purchase.date}`, 20, 70);
  doc.text(`Status: ${purchase.status}`, 20, 80);
  
  if (purchase.notes) {
    doc.text(`Notes: ${purchase.notes}`, 20, 90);
  }
  
  // Add table headers
  let yPosition = 110;
  doc.setFontSize(10);
  doc.text('Product Name', 20, yPosition);
  doc.text('Quantity', 80, yPosition);
  doc.text('Unit Price', 120, yPosition);
  doc.text('Total Amount', 160, yPosition);
  
  // Add line under headers
  doc.line(20, yPosition + 2, 190, yPosition + 2);
  yPosition += 10;
  
  // Check if we have multiple items or single item
  if (purchase.items && purchase.items.length > 0) {
    // Handle multiple items
    purchase.items.forEach((item) => {
      doc.text(item.productName, 20, yPosition);
      doc.text(item.quantity.toString(), 80, yPosition);
      doc.text(`৳${item.unitPrice.toFixed(2)}`, 120, yPosition);
      doc.text(`৳${item.totalAmount.toFixed(2)}`, 160, yPosition);
      yPosition += 10;
    });
    
    // Calculate total for multiple items
    const grandTotal = purchase.items.reduce((sum, item) => sum + item.totalAmount, 0);
    
    // Add total line
    doc.line(20, yPosition, 190, yPosition);
    yPosition += 10;
    doc.setFontSize(12);
    doc.text(`Grand Total: ৳${grandTotal.toFixed(2)}`, 160, yPosition);
  } else {
    // Handle single item (fallback)
    doc.text(purchase.productName, 20, yPosition);
    doc.text(purchase.quantity.toString(), 80, yPosition);
    doc.text(purchase.unitPrice, 120, yPosition);
    doc.text(purchase.totalAmount, 160, yPosition);
    
    yPosition += 20;
    doc.setFontSize(12);
    doc.text(`Total: ${purchase.totalAmount}`, 160, yPosition);
  }
  
  // Save the PDF
  doc.save(`purchase-order-${purchase.purchaseOrderId || purchase.id}.pdf`);
};

export const generateSalesInvoicePDF = (sale: SaleForPDF) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.text('Sales Invoice', 20, 30);
  
  // Add invoice details
  doc.setFontSize(12);
  doc.text(`Invoice ID: ${sale.id}`, 20, 50);
  doc.text(`Customer: ${sale.customerName || 'Walk-in Customer'}`, 20, 60);
  doc.text(`Date: ${sale.date}`, 20, 70);
  doc.text(`Status: ${sale.status}`, 20, 80);
  
  if (sale.notes) {
    doc.text(`Notes: ${sale.notes}`, 20, 90);
  }
  
  // Add table headers
  let yPosition = 110;
  doc.setFontSize(10);
  doc.text('Product Name', 20, yPosition);
  doc.text('Quantity', 80, yPosition);
  doc.text('Unit Price', 120, yPosition);
  doc.text('Total Amount', 160, yPosition);
  
  // Add line under headers
  doc.line(20, yPosition + 2, 190, yPosition + 2);
  yPosition += 10;
  
  // Add sale item
  doc.text(sale.productName, 20, yPosition);
  doc.text(sale.quantity.toString(), 80, yPosition);
  doc.text(sale.unitPrice, 120, yPosition);
  doc.text(sale.totalAmount, 160, yPosition);
  
  yPosition += 20;
  doc.setFontSize(12);
  doc.text(`Total: ${sale.totalAmount}`, 160, yPosition);
  
  // Save the PDF
  doc.save(`sales-invoice-${sale.id}.pdf`);
};
