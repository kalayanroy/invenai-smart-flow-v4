
import jsPDF from 'jspdf';
import { Sale } from '@/hooks/useSales';
import { Purchase } from '@/hooks/usePurchases';

export const generateSalesInvoicePDF = (sale: Sale) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text('SALES INVOICE', 105, 20, { align: 'center' });
  
  // Company info (you can customize this)
  doc.setFontSize(12);
  doc.text('Nahar Enterprise', 20, 40);
  doc.text('Abdul Kadar market, member bari road,', 20, 50);
  doc.text('National University, gazipur city corporation.', 20, 60);
  doc.text('Phone: 01712014171', 20, 70);
  
  // Invoice details
  doc.text(`Invoice ID: ${sale.id}`, 120, 40);
  doc.text(`Date: ${new Date(sale.date).toLocaleDateString()}`, 120, 50);
  doc.text(`Status: ${sale.status}`, 120, 60);
  
  // Customer info
  if (sale.customerName) {
    doc.text('Bill To:', 20, 90);
    doc.text(sale.customerName, 20, 100);
  }
  
  // Table headers
  doc.setFontSize(10);
  doc.text('Product', 20, 120);
  doc.text('Quantity', 80, 120);
  doc.text('Unit Price', 120, 120);
  doc.text('Total', 160, 120);
  
  // Draw line under headers
  doc.line(20, 125, 190, 125);
  
  // Product details
  doc.text(sale.productName, 20, 135);
  doc.text(sale.quantity.toString(), 80, 135);
  doc.text(sale.unitPrice, 120, 135);
  doc.text(sale.totalAmount, 160, 135);
  
  // Total section
  doc.line(20, 145, 190, 145);
  doc.setFontSize(12);
  doc.text(`Total Amount: ${sale.totalAmount}`, 120, 160);
  
  // Notes
  if (sale.notes) {
    doc.setFontSize(10);
    doc.text('Notes:', 20, 180);
    doc.text(sale.notes, 20, 190);
  }
  
  // Footer
  doc.setFontSize(8);
  doc.text('Thank you for your business!', 105, 270, { align: 'center' });
  
  // Save the PDF
  doc.save(`sales-invoice-${sale.id}.pdf`);
};

export const generatePurchaseInvoicePDF = (purchase: Purchase) => {
  const doc = new jsPDF();
  
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
  doc.text(purchase.productName, 20, 135);
  doc.text(purchase.quantity.toString(), 80, 135);
  doc.text(purchase.unitPrice, 120, 135);
  doc.text(purchase.totalAmount, 160, 135);
  
  // Total section
  doc.line(20, 145, 190, 145);
  doc.setFontSize(12);
  doc.text(`Total Amount: ${purchase.totalAmount}`, 120, 160);
  
  // Notes
  if (purchase.notes) {
    doc.setFontSize(10);
    doc.text('Notes:', 20, 180);
    doc.text(purchase.notes, 20, 190);
  }
  
  // Footer
  doc.setFontSize(8);
  doc.text('Purchase Order', 105, 270, { align: 'center' });
  
  // Save the PDF
  doc.save(`purchase-order-${purchase.id}.pdf`);
};
