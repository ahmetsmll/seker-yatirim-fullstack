package com.ahmetsamil.PostgresCrud.service;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

@Service
public class AsyncNotificationService {

    @Async("asyncExecutor")
    public CompletableFuture<String> processReportAndNotify(Long customerId) {
        System.out.println(Thread.currentThread().getName() + " - Müşteri raporu hazırlanıyor... Customer ID: " + customerId);

        try {
            // 3 saniyelik uzun süren işlem simülasyonu (ör. PDF oluşturma veya SMS/Mail atma)
            Thread.sleep(3000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return CompletableFuture.failedFuture(e);
        }

        String resultMessage = "Rapor başarıyla oluşturuldu ve bildirim gönderildi. CustomerID: " + customerId;
        System.out.println(Thread.currentThread().getName() + " - İşlem tamamlandı.");

        // Sonucu CompletableFuture ile sarmallayarak döndürürüz
        return CompletableFuture.completedFuture(resultMessage);
    }
}