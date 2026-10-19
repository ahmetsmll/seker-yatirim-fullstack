package com.ahmetsamil.PostgresCrud.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

@Configuration
@EnableAsync // Spring Boot Asenkron Desteğini Aktif Eder
public class AsyncConfig {

    @Bean(name = "asyncExecutor")
    public Executor asyncExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);   // Arka planda hazır bekleyen thread sayısı
        executor.setMaxPoolSize(10);   // Yoğunluk anında çıkılabilecek max thread sayısı
        executor.setQueueCapacity(25); // İletilen görevlerin kuyruk kapasitesi
        executor.setThreadNamePrefix("FintechAsync-");
        executor.initialize();
        return executor;
    }
}