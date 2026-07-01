package com.safarikids.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.concurrent.CompletableFuture;

/**
 * Notificaciones internas para el personal vía Telegram Bot API.
 * Se configura con TELEGRAM_BOT_TOKEN (token de @BotFather) y TELEGRAM_CHAT_ID
 * (el chat o grupo del equipo que recibe los avisos).
 * Si no hay token/chat configurados, el envío se omite silenciosamente (la app sigue funcionando).
 * Los envíos son "fire-and-forget": nunca bloquean ni rompen la operación principal.
 */
@Service
public class TelegramService {

    private static final Logger log = LoggerFactory.getLogger(TelegramService.class);

    private final HttpClient http = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(10)).build();

    @Value("${telegram.bot-token:}")
    private String botToken;

    @Value("${telegram.chat-id:}")
    private String chatId;

    private boolean habilitado() {
        return botToken != null && !botToken.isBlank()
            && chatId != null && !chatId.isBlank();
    }

    /** Envío genérico de texto (HTML) al chat del personal. Asíncrono y tolerante a fallos. */
    public void enviar(String texto) {
        if (!habilitado()) {
            log.info("[Telegram] TELEGRAM_BOT_TOKEN/CHAT_ID no configurados — se omite aviso");
            return;
        }

        String url = "https://api.telegram.org/bot" + botToken + "/sendMessage";
        String body = "chat_id=" + enc(chatId)
            + "&parse_mode=HTML"
            + "&disable_web_page_preview=true"
            + "&text=" + enc(texto);

        HttpRequest req = HttpRequest.newBuilder()
            .uri(URI.create(url))
            .timeout(Duration.ofSeconds(15))
            .header("Content-Type", "application/x-www-form-urlencoded")
            .POST(HttpRequest.BodyPublishers.ofString(body))
            .build();

        CompletableFuture
            .supplyAsync(() -> {
                try {
                    return http.send(req, HttpResponse.BodyHandlers.ofString());
                } catch (Exception e) {
                    throw new RuntimeException(e);
                }
            })
            .thenAccept(resp -> {
                if (resp.statusCode() >= 200 && resp.statusCode() < 300) {
                    log.info("[Telegram] Aviso enviado");
                } else {
                    log.warn("[Telegram] Fallo ({}): {}", resp.statusCode(), resp.body());
                }
            })
            .exceptionally(ex -> {
                log.warn("[Telegram] Error enviando aviso: {}", ex.getMessage());
                return null;
            });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Avisos específicos para el personal
    // ─────────────────────────────────────────────────────────────────────────

    public void avisarNuevaReserva(String codigo, String cliente, String servicio,
            String fecha, String hora, String local, String estilista) {
        enviar("🗓️ <b>Nueva reserva</b>\n"
            + linea("Código", codigo)
            + linea("Cliente", cliente)
            + linea("Servicio", servicio)
            + linea("Fecha", fecha)
            + linea("Hora", hora)
            + linea("Sede", local)
            + linea("Estilista", estilista));
    }

    public void avisarNuevoPago(String codigo, String cliente, String monto,
            String metodo, boolean pendiente) {
        enviar((pendiente ? "💵 <b>Pago pendiente (efectivo)</b>\n" : "✅ <b>Pago confirmado</b>\n")
            + linea("Código", codigo)
            + linea("Cliente", cliente)
            + linea("Monto", monto)
            + linea("Método", metodo));
    }

    public void avisarCancelacion(String codigo, String cliente, String fecha) {
        enviar("❌ <b>Reserva cancelada</b>\n"
            + linea("Código", codigo)
            + linea("Cliente", cliente)
            + linea("Fecha", fecha));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────

    private String linea(String label, String valor) {
        if (valor == null || valor.isBlank()) return "";
        return "• <b>" + esc(label) + ":</b> " + esc(valor) + "\n";
    }

    private String esc(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }

    private String enc(String s) {
        return URLEncoder.encode(s == null ? "" : s, StandardCharsets.UTF_8);
    }
}
