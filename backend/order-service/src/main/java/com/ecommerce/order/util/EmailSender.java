package com.ecommerce.order.util;

import com.ecommerce.order.dto.OrderResponse;
import com.ecommerce.order.model.OrderItem;
import jakarta.mail.*;
import jakarta.mail.internet.*;

import java.util.Properties;

public class EmailSender {

    private static final String SMTP_HOST = "smtp.gmail.com";
    private static final String SMTP_PORT = "587";
    private static final String USERNAME = "laurite.style@gmail.com";
    // Password should be injected via AWS Lambda Environment Variables
    private static final String PASSWORD = System.getenv("EMAIL_PASSWORD"); 

    /**
     * Sends an HTML order confirmation email synchronously.
     */
    public static void sendOrderConfirmation(String recipientEmail, OrderResponse order) {
        if (recipientEmail == null || recipientEmail.isBlank()) {
            System.err.println("Cannot send email: recipient is missing.");
            return;
        }

        try {
            sendEmailSync(recipientEmail, order);
        } catch (Exception e) {
            System.err.println("Failed to send order confirmation: " + e.getMessage());
        }
    }

    private static void sendEmailSync(String recipientEmail, OrderResponse order) throws MessagingException, java.io.UnsupportedEncodingException {
        Properties props = new Properties();
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.host", SMTP_HOST);
        props.put("mail.smtp.port", SMTP_PORT);

        Session session = Session.getInstance(props, new Authenticator() {
            @Override
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(USERNAME, PASSWORD);
            }
        });

        Message message = new MimeMessage(session);
        message.setFrom(new InternetAddress(USERNAME, "LAURITE Style"));
        message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(recipientEmail));
        message.setSubject("LAURITE | Your Order Confirmation - " + order.getOrderId());

        // Construct luxury HTML Invoice
        StringBuilder html = new StringBuilder();
        html.append("<html>")
            .append("<body style='font-family: \"Georgia\", serif; background-color: #faf8f5; color: #1c1917; margin: 0; padding: 40px; text-align: center;'>")
            .append("<div style='max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px; border: 1px solid rgba(212,197,185,0.4); border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.03);'>")
            
            // Header
            .append("<h1 style='font-weight: 400; letter-spacing: 0.1em; color: #1c1917; margin-bottom: 10px;'>")
            .append("<span style='color: #c5a059;'>L</span>AURITE")
            .append("</h1>")
            .append("<p style='text-transform: uppercase; letter-spacing: 0.2em; font-size: 0.85rem; color: #57534e; margin-top: 0;'>Style & Elegance</p>")
            
            .append("<hr style='border: 0; border-top: 1px solid rgba(212,197,185,0.4); margin: 30px 0;'>")
            
            // Greeting & Order ID
            .append("<h2 style='font-weight: 500;'>Thank You For Your Order</h2>")
            .append("<p style='font-family: \"Arial\", sans-serif; color: #57534e; line-height: 1.6;'>")
            .append("Your order has been successfully placed and is now being curated with the utmost care.")
            .append("</p>")
            .append("<p style='font-family: \"Arial\", sans-serif; font-size: 0.9rem; margin-bottom: 30px;'>")
            .append("<strong>ORDER REFERENCE:</strong> ").append(order.getOrderId())
            .append("</p>")
            
            // Invoice Table
            .append("<div style='text-align: left; background: #f4efe6; padding: 20px; border-radius: 8px;'>")
            .append("<h3 style='margin-top: 0; font-size: 1.1rem; border-bottom: 1px solid rgba(212,197,185,0.4); padding-bottom: 10px;'>Invoice Details</h3>")
            .append("<table style='width: 100%; border-collapse: collapse; font-family: \"Arial\", sans-serif; font-size: 0.95rem;'>");

        for (OrderItem item : order.getItems()) {
            double lineTotal = item.getPrice() * item.getQuantity();
            html.append("<tr>")
                .append("<td style='padding: 10px 0; border-bottom: 1px solid rgba(212,197,185,0.3);'>")
                .append("<strong>").append(item.getProductName()).append("</strong><br>")
                .append("<span style='color: #57534e; font-size: 0.85rem;'>Qty: ").append(item.getQuantity()).append("</span>")
                .append("</td>")
                .append("<td style='padding: 10px 0; text-align: right; border-bottom: 1px solid rgba(212,197,185,0.3);'>")
                .append("&#8377;").append(String.format("%.2f", lineTotal))
                .append("</td>")
                .append("</tr>");
        }

        // Total
        html.append("<tr>")
            .append("<td style='padding: 15px 0 0 0; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em;'>Total Amount</td>")
            .append("<td style='padding: 15px 0 0 0; text-align: right; font-weight: bold; color: #c5a059; font-size: 1.2rem;'>")
            .append("&#8377;").append(String.format("%.2f", order.getTotalAmount()))
            .append("</td>")
            .append("</tr>")
            .append("</table>")
            .append("</div>") // End invoice table
            
            // Footer
            .append("<p style='font-family: \"Arial\", sans-serif; font-size: 0.85rem; color: #57534e; margin-top: 40px;'>")
            .append("If you have any questions regarding your order, please contact our concierge service.")
            .append("</p>")
            .append("<p style='font-family: \"Arial\", sans-serif; font-size: 0.75rem; color: #a8a29e;'>")
            .append("&copy; ").append(java.time.Year.now().getValue()).append(" LAURITE Style. All rights reserved.")
            .append("</p>")
            
            .append("</div>")
            .append("</body>")
            .append("</html>");

        message.setContent(html.toString(), "text/html; charset=utf-8");

        Transport.send(message);
        System.out.println("Order confirmation email sent successfully to " + recipientEmail);
    }

    /**
     * Sends a contact form email directly to laurite.style@gmail.com
     */
    public static void sendContactEmail(String senderName, String senderEmail, String subject, String messageContent) {
        try {
            sendContactEmailSync(senderName, senderEmail, subject, messageContent);
        } catch (Exception e) {
            System.err.println("Failed to send contact email: " + e.getMessage());
        }
    }

    private static void sendContactEmailSync(String senderName, String senderEmail, String subject, String messageContent) throws MessagingException, java.io.UnsupportedEncodingException {
        Properties props = new Properties();
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.host", SMTP_HOST);
        props.put("mail.smtp.port", SMTP_PORT);

        Session session = Session.getInstance(props, new Authenticator() {
            @Override
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(USERNAME, PASSWORD);
            }
        });

        Message message = new MimeMessage(session);
        message.setFrom(new InternetAddress(USERNAME, "LAURITE System"));
        // Send to ourselves
        message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(USERNAME));
        // Set Reply-To to the customer so that replying goes to them!
        if (senderEmail != null && !senderEmail.isBlank()) {
            message.setReplyTo(InternetAddress.parse(senderEmail));
        }
        message.setSubject("New Contact Inquiry: " + (subject != null && !subject.isBlank() ? subject : "No Subject"));

        // Construct HTML email
        StringBuilder html = new StringBuilder();
        html.append("<html>")
            .append("<body style='font-family: \"Arial\", sans-serif; background-color: #f4efe6; color: #1c1917; margin: 0; padding: 40px;'>")
            .append("<div style='max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);'>")
            
            .append("<h2 style='color: #c5a059; margin-top: 0; border-bottom: 2px solid #f4efe6; padding-bottom: 15px;'>New Concierge Inquiry</h2>")
            
            .append("<p><strong>From:</strong> ").append(senderName).append("</p>")
            .append("<p><strong>Email:</strong> <a href='mailto:").append(senderEmail).append("'>").append(senderEmail).append("</a></p>")
            .append("<p><strong>Subject:</strong> ").append(subject != null && !subject.isBlank() ? subject : "N/A").append("</p>")
            
            .append("<div style='background: #faf8f5; padding: 20px; border-radius: 8px; margin-top: 30px; border: 1px solid #ede6d6;'>")
            .append("<h4 style='margin-top: 0; color: #57534e; text-transform: uppercase; font-size: 0.8rem; letter-spacing: 0.1em;'>Message Details:</h4>")
            .append("<p style='line-height: 1.6; white-space: pre-wrap;'>").append(messageContent).append("</p>")
            .append("</div>")
            
            .append("<p style='font-size: 0.8rem; color: #a8a29e; margin-top: 40px; border-top: 1px solid #f4efe6; padding-top: 20px;'>")
            .append("This email was automatically generated by the LAURITE Contact Form.")
            .append("</p>")
            
            .append("</div>")
            .append("</body>")
            .append("</html>");

        message.setContent(html.toString(), "text/html; charset=utf-8");

        Transport.send(message);
        System.out.println("Contact email from " + senderEmail + " sent successfully to " + USERNAME);
    }
}
