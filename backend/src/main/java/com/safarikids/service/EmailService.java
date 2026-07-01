package com.safarikids.service;

import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.concurrent.CompletableFuture;

/**
 * Envío de correos transaccionales vía Gmail SMTP (JavaMailSender).
 * Se configura con las variables de entorno MAIL_USERNAME y MAIL_PASSWORD
 * (usar una "contraseña de aplicación" de Gmail, no la contraseña normal).
 * Si no hay credenciales configuradas, el envío se omite silenciosamente (la app sigue funcionando).
 * Los envíos son "fire-and-forget": nunca bloquean ni rompen la operación principal.
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String username;

    @Value("${app.mail.from-name:Safari Kids}")
    private String fromName;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    /** Si está seteada, se envía por la API HTTP de Brevo (puerto 443) en vez de SMTP.
     *  Necesario en hostings como Railway que bloquean los puertos SMTP (25/465/587). */
    @Value("${brevo.api-key:}")
    private String brevoApiKey;

    private static final java.net.http.HttpClient HTTP = java.net.http.HttpClient.newBuilder()
        .connectTimeout(java.time.Duration.ofSeconds(10)).build();

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    private boolean usaBrevo() {
        return brevoApiKey != null && !brevoApiKey.isBlank();
    }

    /** Transporte activo, para diagnóstico. */
    public String transporte() {
        return usaBrevo() ? "Brevo (HTTP)" : "SMTP";
    }

    private boolean habilitado() {
        // En ambos transportes el remitente es la cuenta configurada (Gmail verificado en Brevo).
        return username != null && !username.isBlank();
    }

    /** Envío síncrono real; devuelve null si OK o el mensaje de error. Elige transporte automáticamente. */
    private String enviarSync(String destino, String asunto, String html) {
        return usaBrevo() ? enviarViaBrevo(destino, asunto, html) : enviarViaSmtp(destino, asunto, html);
    }

    private String enviarViaSmtp(String destino, String asunto, String html) {
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, false, StandardCharsets.UTF_8.name());
            // Gmail obliga a que el remitente sea la cuenta autenticada; solo personalizamos el nombre.
            helper.setFrom(new InternetAddress(username, fromName, StandardCharsets.UTF_8.name()));
            helper.setTo(destino);
            helper.setSubject(asunto);
            helper.setText(html, true);
            mailSender.send(msg);
            return null;
        } catch (Exception e) {
            return e.getClass().getSimpleName() + ": " + e.getMessage();
        }
    }

    private String enviarViaBrevo(String destino, String asunto, String html) {
        try {
            String body = "{"
                + "\"sender\":{\"name\":" + jsonStr(fromName) + ",\"email\":" + jsonStr(username) + "},"
                + "\"to\":[{\"email\":" + jsonStr(destino) + "}],"
                + "\"subject\":" + jsonStr(asunto) + ","
                + "\"htmlContent\":" + jsonStr(html)
                + "}";
            java.net.http.HttpRequest req = java.net.http.HttpRequest.newBuilder()
                .uri(java.net.URI.create("https://api.brevo.com/v3/smtp/email"))
                .timeout(java.time.Duration.ofSeconds(15))
                .header("api-key", brevoApiKey)
                .header("content-type", "application/json")
                .header("accept", "application/json")
                .POST(java.net.http.HttpRequest.BodyPublishers.ofString(body, StandardCharsets.UTF_8))
                .build();
            java.net.http.HttpResponse<String> res = HTTP.send(req, java.net.http.HttpResponse.BodyHandlers.ofString());
            if (res.statusCode() / 100 == 2) return null;
            return "Brevo HTTP " + res.statusCode() + ": " + res.body();
        } catch (Exception e) {
            return e.getClass().getSimpleName() + ": " + e.getMessage();
        }
    }

    /** Escapa una cadena como literal JSON (con comillas incluidas). */
    private static String jsonStr(String s) {
        if (s == null) return "\"\"";
        StringBuilder b = new StringBuilder("\"");
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            switch (c) {
                case '"':  b.append("\\\""); break;
                case '\\': b.append("\\\\"); break;
                case '\n': b.append("\\n");  break;
                case '\r': b.append("\\r");  break;
                case '\t': b.append("\\t");  break;
                default:
                    if (c < 0x20) b.append(String.format("\\u%04x", (int) c));
                    else b.append(c);
            }
        }
        return b.append('"').toString();
    }

    /** ¿Es un correo real al que podemos escribir? (las cuentas walk-in usan un correo ficticio) */
    private boolean correoValido(String correo) {
        return correo != null && correo.contains("@") && !correo.endsWith("@walkin.safarikids");
    }

    /** Envío genérico, asíncrono y tolerante a fallos. */
    public void enviar(String destino, String asunto, String html) {
        if (!habilitado()) {
            log.info("[Email] MAIL_USERNAME no configurado — se omite envío a {}", destino);
            return;
        }
        if (!correoValido(destino)) {
            log.info("[Email] Destino no válido o cuenta provisional, se omite: {}", destino);
            return;
        }

        CompletableFuture.runAsync(() -> {
            String err = enviarSync(destino, asunto, html);
            if (err == null) log.info("[Email] Enviado a {} — {} (vía {})", destino, asunto, transporte());
            else             log.warn("[Email] Error enviando a {} (vía {}): {}", destino, transporte(), err);
        });
    }

    /**
     * Envío SÍNCRONO para diagnóstico: no traga el error, lo devuelve.
     * @return null si se envió bien, o "Clase: mensaje" con el error real.
     */
    public String enviarDiagnostico(String destino, String asunto, String html) {
        if (!habilitado()) return "Remitente no configurado (falta MAIL_USERNAME)";
        String err = enviarSync(destino, asunto, html);
        if (err == null) log.info("[Email][DIAG] Enviado a {} vía {}", destino, transporte());
        else             log.warn("[Email][DIAG] Error enviando a {} vía {}: {}", destino, transporte(), err);
        return err;
    }

    public boolean estaConfigurado() { return habilitado(); }
    public String usernameConfigurado() { return username == null ? "" : username; }

    // ─────────────────────────────────────────────────────────────────────────
    // Correos específicos
    // ─────────────────────────────────────────────────────────────────────────

    public void enviarBienvenida(String correo, String nombre) {
        String html = layout("¡Bienvenido a Safari Kids! 🦁",
            "<p>Hola <b>" + esc(nombre) + "</b>,</p>"
            + "<p>¡Gracias por unirte a la familia <b>Safari Kids</b>! Ya puedes reservar citas, "
            + "ver tu historial y comprar productos para tus peques.</p>"
            + "<p style=\"text-align:center\"><a href=\"" + frontendUrl + "/mi-cuenta\" "
            + "style=\"display:inline-block;background:#1B7A3E;color:#fff;text-decoration:none;"
            + "padding:12px 28px;border-radius:999px;font-weight:bold\">Ir a mi cuenta</a></p>");
        enviar(correo, "¡Bienvenido a Safari Kids! 🦁", html);
    }

    public void enviarConfirmacionReserva(String correo, String nombre, String codigo,
            String servicio, String fecha, String hora, String local, boolean efectivo) {
        String estado = efectivo
            ? "<p>Tu reserva quedó <b>registrada</b>. Presenta tu código al llegar para pagar en el salón.</p>"
            : "<p>¡Tu reserva está <b>confirmada</b> y pagada! Te esperamos. 🎉</p>";
        String html = layout("Reserva " + (efectivo ? "registrada" : "confirmada") + " ✂️",
            "<p>Hola <b>" + esc(nombre) + "</b>,</p>"
            + estado
            + detalle("Código", codigo)
            + detalle("Servicio", servicio)
            + detalle("Fecha", fecha)
            + detalle("Hora", hora)
            + detalle("Sede", local));
        enviar(correo, "Tu reserva en Safari Kids — " + codigo, html);
    }

    public void enviarCancelacionReserva(String correo, String nombre, String codigo, String fecha) {
        String html = layout("Reserva cancelada",
            "<p>Hola <b>" + esc(nombre) + "</b>,</p>"
            + "<p>Tu reserva <b>" + esc(codigo) + "</b>"
            + (fecha != null ? " del <b>" + esc(fecha) + "</b>" : "")
            + " ha sido <b>cancelada</b>.</p>"
            + "<p>Si no fuiste tú o deseas reagendar, ingresa a tu cuenta cuando quieras.</p>");
        enviar(correo, "Reserva cancelada — Safari Kids", html);
    }

    public void enviarRecordatorio(String correo, String nombre, String codigo,
            String fecha, String hora, String local) {
        String html = layout("Recordatorio de tu cita ⏰",
            "<p>Hola <b>" + esc(nombre) + "</b>,</p>"
            + "<p>Te recordamos que tu cita en <b>Safari Kids</b> es <b>en aproximadamente 1 hora</b>. "
            + "¡Te esperamos! 🦁</p>"
            + detalle("Código", codigo)
            + detalle("Fecha", fecha)
            + detalle("Hora", hora)
            + detalle("Sede", local));
        enviar(correo, "Recordatorio: tu cita es en 1 hora — Safari Kids", html);
    }

    public void enviarCambioPassword(String correo, String nombre) {
        String html = layout("Tu contraseña fue cambiada 🔒",
            "<p>Hola <b>" + esc(nombre) + "</b>,</p>"
            + "<p>Te confirmamos que la contraseña de tu cuenta de <b>Safari Kids</b> se cambió correctamente.</p>"
            + "<p>Si <b>no</b> realizaste este cambio, contáctanos de inmediato.</p>");
        enviar(correo, "Cambio de contraseña — Safari Kids", html);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers de plantilla
    // ─────────────────────────────────────────────────────────────────────────

    private String detalle(String label, String valor) {
        if (valor == null || valor.isBlank()) return "";
        return "<tr><td style=\"padding:6px 0;color:#888;font-size:14px\">" + esc(label) + "</td>"
            + "<td style=\"padding:6px 0;text-align:right;font-weight:bold;color:#1A2E1A;font-size:14px\">"
            + esc(valor) + "</td></tr>";
    }

    private String layout(String titulo, String cuerpo) {
        boolean tieneTabla = cuerpo.contains("<tr>");
        String contenido = cuerpo;
        if (tieneTabla) {
            int idx = cuerpo.indexOf("<tr>");
            contenido = cuerpo.substring(0, idx)
                + "<table style=\"width:100%;border-collapse:collapse;margin:16px 0;"
                + "background:#f9f9f9;border-radius:12px;padding:8px 16px\">"
                + cuerpo.substring(idx) + "</table>";
        }
        return "<div style=\"font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;"
            + "background:#fff;border:3px solid #1A2E1A;border-radius:18px;overflow:hidden\">"
            + "<div style=\"background:linear-gradient(135deg,#1B7A3E,#33A957);padding:24px;text-align:center\">"
            + "<h1 style=\"color:#fff;margin:0;font-size:22px\">" + esc(titulo) + "</h1></div>"
            + "<div style=\"padding:24px;color:#333;font-size:15px;line-height:1.6\">" + contenido
            + "<p style=\"margin-top:24px;color:#aaa;font-size:12px;text-align:center\">"
            + "Safari Kids — Peluquería infantil 🌿</p></div></div>";
    }

    private String esc(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }
}
