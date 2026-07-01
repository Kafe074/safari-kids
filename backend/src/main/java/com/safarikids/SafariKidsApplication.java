package com.safarikids;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

import jakarta.annotation.PostConstruct;
import java.util.TimeZone;

@SpringBootApplication
@EnableScheduling
public class SafariKidsApplication {

    /** Zona horaria de Perú para que fechas/horas y el recordatorio "1h antes" usen la hora local (no UTC de Railway). */
    @PostConstruct
    public void init() {
        TimeZone.setDefault(TimeZone.getTimeZone("America/Lima"));
    }

    public static void main(String[] args) {
        SpringApplication.run(SafariKidsApplication.class, args);
    }
}
