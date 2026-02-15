import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export const InvoiceService = {
    generateInvoice(order: any) {
        const doc = new jsPDF() as any;
        const pageWidth = doc.internal.pageSize.width;

        // --- Header & Branding ---
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text('ABC Toyz', 20, 25);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100);
        doc.text('Premium Ride-on Toys for Kids', 20, 32);

        // Invoice Label
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(33, 150, 243); // Primary Blue
        doc.text('INVOICE', pageWidth - 20, 25, { align: 'right' });

        // --- Order & Date Info ---
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(50);
        doc.text(`Order ID: #${order.id.substring(0, 8).toUpperCase()}`, pageWidth - 20, 35, { align: 'right' });
        doc.text(`Date: ${new Date(order.created_at).toLocaleDateString('en-IN')}`, pageWidth - 20, 40, { align: 'right' });
        doc.text(`Payment: ${order.payment_method || 'PREPAID'}`, pageWidth - 20, 45, { align: 'right' });

        // Divider
        doc.setDrawColor(240);
        doc.line(20, 55, pageWidth - 20, 55);

        // --- Addresses ---
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0);
        doc.text('BILL TO:', 20, 65);
        doc.text('SHIP TO:', pageWidth / 2 + 10, 65);

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80);

        const address = order.shipping_address;
        if (address) {
            // Bill To (Assuming same as shipping)
            doc.text(address.name, 20, 72);
            doc.text(address.address_line1, 20, 77);
            if (address.address_line2) doc.text(address.address_line2, 20, 82);
            doc.text(`${address.city}, ${address.state} - ${address.pincode}`, 20, address.address_line2 ? 87 : 82);
            doc.text(`Phone: ${address.phone}`, 20, address.address_line2 ? 92 : 87);

            // Ship To
            doc.text(address.name, pageWidth / 2 + 10, 72);
            doc.text(address.address_line1, pageWidth / 2 + 10, 77);
            if (address.address_line2) doc.text(address.address_line2, pageWidth / 2 + 10, 82);
            doc.text(`${address.city}, ${address.state} - ${address.pincode}`, pageWidth / 2 + 10, address.address_line2 ? 87 : 82);
            doc.text(`Phone: ${address.phone}`, pageWidth / 2 + 10, address.address_line2 ? 92 : 87);
        }

        // --- Items Table ---
        const tableData = order.items.map((item: any) => [
            item.product_name,
            `INR ${Number(item.price).toLocaleString()}`,
            item.quantity,
            `INR ${(Number(item.price) * Number(item.quantity)).toLocaleString()}`
        ]);

        doc.autoTable({
            startY: 105,
            head: [['Product Details', 'Rate', 'Qty', 'Amount']],
            body: tableData,
            theme: 'striped',
            headStyles: {
                fillColor: [30, 30, 30],
                textColor: [255, 255, 255],
                fontSize: 9,
                fontStyle: 'bold',
                halign: 'left'
            },
            bodyStyles: {
                fontSize: 8,
                textColor: [50, 50, 50]
            },
            columnStyles: {
                0: { cellWidth: 100 },
                1: { halign: 'right' },
                2: { halign: 'center' },
                3: { halign: 'right' }
            },
            margin: { left: 20, right: 20 }
        });

        // --- Totals ---
        const finalY = (doc as any).lastAutoTable.finalY + 10;

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100);
        doc.text('Subtotal:', pageWidth - 60, finalY, { align: 'right' });
        doc.text(`INR ${order.total_amount.toLocaleString()}`, pageWidth - 20, finalY, { align: 'right' });

        doc.text('Shipping:', pageWidth - 60, finalY + 5, { align: 'right' });
        doc.text('FREE', pageWidth - 20, finalY + 5, { align: 'right' });

        doc.setDrawColor(0);
        doc.setLineWidth(0.5);
        doc.line(pageWidth - 70, finalY + 8, pageWidth - 20, finalY + 8);

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0);
        doc.text('TOTAL AMOUNT:', pageWidth - 60, finalY + 15, { align: 'right' });
        doc.text(`INR ${order.total_amount.toLocaleString()}`, pageWidth - 20, finalY + 15, { align: 'right' });

        // --- Footer ---
        const footerY = doc.internal.pageSize.height - 30;
        doc.setDrawColor(240);
        doc.line(20, footerY, pageWidth - 20, footerY);

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(150);
        doc.text('Thank you for shopping with ABC Toyz!', pageWidth / 2, footerY + 10, { align: 'center' });
        doc.text('ABC Toyz Logistics | New Delhi, India | support@abctoyz.com', pageWidth / 2, footerY + 15, { align: 'center' });
        doc.text('This is a computer-generated invoice and does not require a physical signature.', pageWidth / 2, footerY + 20, { align: 'center' });

        // Save the PDF
        doc.save(`Invoice_${order.id.substring(0, 8).toUpperCase()}.pdf`);
    }
};
