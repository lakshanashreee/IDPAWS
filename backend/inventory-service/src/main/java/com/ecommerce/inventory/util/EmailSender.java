package com.ecommerce.inventory.util;

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
     * Sends a restock notification email synchronously.
     */
    public static void sendRestockNotification(String recipientEmail, String productId, String imageUrl, String productName) {
        if (recipientEmail == null || recipientEmail.isBlank()) {
            System.err.println("Cannot send email: recipient is missing.");
            return;
        }

        try {
            sendRestockEmailSync(recipientEmail, productId, imageUrl, productName);
        } catch (Exception e) {
            System.err.println("Failed to send restock notification: " + e.getMessage());
        }
    }

    private static void sendRestockEmailSync(String recipientEmail, String productId, String imageUrl, String productName) throws MessagingException, java.io.UnsupportedEncodingException {
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
        message.setSubject("LAURITE | Your Item is Restocked!");

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
            
            // Content
            .append("<h2 style='font-weight: 500;'>Back in Stock</h2>")
            .append("<p style='font-family: \"Arial\", sans-serif; color: #57534e; line-height: 1.6;'>")
            .append("The product you were waiting for has just been restocked! We wanted you to be the first to know so you can grab yours before it sells out again.")
            .append("</p>")
            
            .append("<div style='margin: 30px 0;'>");
            
        if (imageUrl != null && !imageUrl.isBlank()) {
            html.append("<img src='").append(imageUrl).append("' alt='Product Image' style='max-width: 100%; height: auto; max-height: 300px; border-radius: 8px;'/>");
        }
        
        if (productName != null && !productName.isBlank()) {
            html.append("<h3 style='font-weight: 500; font-family: \"Arial\", sans-serif; margin-top: 15px;'>").append(productName).append("</h3>");
        }
            
        html.append("</div>")
            .append("<a href='https://dysvqlh33nqi5.cloudfront.net/' style='display: inline-block; padding: 12px 24px; background-color: #1c1917; color: #ffffff; text-decoration: none; font-family: \"Arial\", sans-serif; text-transform: uppercase; letter-spacing: 0.1em; border-radius: 4px; font-size: 0.9rem;'>Shop Now</a>")
            
            // Footer
            .append("<hr style='border: 0; border-top: 1px solid rgba(212,197,185,0.4); margin: 30px 0;'>")
            .append("<p style='font-family: \"Arial\", sans-serif; font-size: 0.8rem; color: #a8a29e;'>")
            .append("Thank you for shopping with LAURITE.<br>")
            .append("If you have any questions, please reply to this email.")
            .append("</p>")
            
            .append("</div>")
            .append("</body>")
            .append("</html>");

        message.setContent(html.toString(), "text/html; charset=utf-8");

        Transport.send(message);
        System.out.println("Restock notification email sent successfully to " + recipientEmail);
    }
}
