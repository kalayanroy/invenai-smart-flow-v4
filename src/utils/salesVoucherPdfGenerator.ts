
import jsPDF from 'jspdf';
import { SalesVoucher } from '@/hooks/useSalesVouchers';

export const generateSalesVoucherPDF = (voucher: SalesVoucher) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text('SALES VOUCHER', 105, 20, { align: 'center' });
  
  // Company info (you can customize this)
  doc.setFontSize(12);
  doc.text('Your Company Name', 20, 40);
  doc.text('Your Company Address', 20, 50);
  doc.text('Phone: Your Phone Number', 20, 60);
  
  // Voucher details
  doc.text(`Voucher No: ${voucher.voucherNumber}`, 120, 40);
  doc.text(`Date: ${new Date(voucher.date).toLocaleDateString()}`, 120, 50);
  doc.text(`Customer: ${voucher.customerName || 'Walk-in Customer'}`, 120, 60);
  doc.text(`Payment: ${voucher.paymentMethod}`, 120, 70);
  
  // Table headers
  let y = 90;
  doc.setFontSize(10);
  doc.text('Product', 20, y);
  doc.text('Qty', 120, y);
  doc.text('Unit Price', 140, y);
  doc.text('Total', 170, y);
  
  // Draw line under headers
  doc.line(20, y + 2, 190, y + 2);
  y += 10;
  
  // Items
  voucher.items.forEach((item) => {
    doc.text(item.productName, 20, y);
    doc.text(item.quantity.toString(), 120, y);
    doc.text(`৳${item.unitPrice.toLocaleString()}`, 140, y);
    doc.text(`৳${item.totalAmount.toLocaleString()}`, 170, y);
    y += 8;
  });
  
  // Totals
  y += 10;
  doc.line(120, y, 190, y);
  y += 10;
  
  doc.text(`Subtotal: ৳${voucher.totalAmount.toLocaleString()}`, 120, y);
  y += 8;
  
  if (voucher.discountAmount > 0) {
    doc.text(`Discount: ৳${voucher.discountAmount.toLocaleString()}`, 120, y);
    y += 8;
  }
  
  doc.setFontSize(12);
  doc.text(`Total: ৳${voucher.finalAmount.toLocaleString()}`, 120, y);
  
  // Footer
  y += 30;
  doc.setFontSize(10);
  doc.text('Thank you for your business!', 105, y, { align: 'center' });
  
  // Save the PDF
  doc.save(`sales-voucher-${voucher.voucherNumber}.pdf`);
};
