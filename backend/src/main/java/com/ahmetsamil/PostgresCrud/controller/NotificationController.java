package com.ahmetsamil.PostgresCrud.controller;

import com.ahmetsamil.PostgresCrud.service.AsyncNotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final AsyncNotificationService asyncNotificationService;

    public NotificationController(AsyncNotificationService asyncNotificationService) {
        this.asyncNotificationService = asyncNotificationService;
    }

    @PostMapping("/send-report/{customerId}")
    public ResponseEntity<String> triggerAsyncReport(@PathVariable Long customerId) {
        System.out.println("HTTP İstegi Alındı. Thread: " + Thread.currentThread().getName());

        // Asenkron servisi tetikle ve Callback ekle
        asyncNotificationService.processReportAndNotify(customerId)
                .thenAccept(callbackResult -> {
                    // Callback 1: İşlem başarıyla bittiğinde tetiklenir
                    System.out.println("[CALLBACK BAŞARILI] " + callbackResult);
                })
                .exceptionally(ex -> {
                    // Callback 2: İşlem sırasında bir hata oluşursa tetiklenir
                    System.err.println("[CALLBACK HATA] İşlem sırasında hata oluştu: " + ex.getMessage());
                    return null;
                });

        // Kullanıcıyı 3 saniye bekletmeden ANINDA yanıt dönüyoruz
        return ResponseEntity.ok("Rapor oluşturma işlemi arka planda başlatıldı. İşlem bittiğinde sistem güncellenecektir.");
    }
}