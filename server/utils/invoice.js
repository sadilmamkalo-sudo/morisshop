const PDFDocument = require('pdfkit');

const generateInvoice = (order, user) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      doc.fontSize(28).fillColor('#f59e0b').text('MORISSESHOP', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(18).fillColor('#333').text('Order Invoice', { align: 'center' });
      doc.moveDown();

      doc.fontSize(10).fillColor('#666').text(`Order ID: ${order._id}`, { align: 'right' });
      doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, { align: 'right' });
      doc.moveDown();

      doc.fontSize(12).fillColor('#333').text('Client:');
      doc.fontSize(10).fillColor('#666').text(`Name: ${user.name}`);
      doc.text(`Email: ${user.email}`);
      doc.text(`Phone: ${user.phone || 'N/A'}`);
      doc.text(`Address: ${order.shippingAddress?.street || ''}, ${order.shippingAddress?.city || ''}`);
      doc.moveDown();

      doc.fontSize(12).fillColor('#333').text('Items:');
      doc.moveDown(0.3);

      const tableTop = doc.y;
      doc.fontSize(10).fillColor('#fff');
      doc.rect(50, tableTop, 500, 20).fill('#f59e0b');
      doc.fillColor('#fff').text('Product', 60, tableTop + 5);
      doc.text('Qty', 350, tableTop + 5, { width: 50, align: 'center' });
      doc.text('Price', 420, tableTop + 5, { width: 60, align: 'center' });
      doc.text('Total', 500, tableTop + 5, { width: 60, align: 'right' });

      let y = tableTop + 25;
      order.items.forEach(item => {
        doc.fontSize(10).fillColor('#333');
        doc.text(item.name?.en || 'Product', 60, y);
        doc.text(String(item.quantity), 350, y, { width: 50, align: 'center' });
        doc.text(`${item.price} DH`, 420, y, { width: 60, align: 'center' });
        doc.text(`${(item.price * item.quantity).toFixed(2)} DH`, 500, y, { width: 60, align: 'right' });
        y += 20;
      });

      doc.moveDown(2);
      doc.fontSize(12).fillColor('#333');
      doc.text(`Subtotal: ${order.itemsPrice?.toFixed(2)} DH`, { align: 'right' });
      if (order.discountAmount > 0) {
        doc.fillColor('#16a34a').text(`Discount: -${order.discountAmount?.toFixed(2)} DH`, { align: 'right' });
      }
      doc.fillColor('#333').fontSize(14).font('Helvetica-Bold');
      doc.text(`Total: ${order.totalPrice?.toFixed(2)} DH`, { align: 'right' });

      doc.moveDown(2);
      doc.fontSize(10).fillColor('#999').text('Thank you for shopping with MORISSESHOP!', { align: 'center' });

      doc.end();
    } catch (err) { reject(err); }
  });
};

module.exports = { generateInvoice };
