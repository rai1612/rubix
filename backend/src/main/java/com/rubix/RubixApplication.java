package com.rubix;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication(exclude = {
    org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration.class
})
@EnableJpaAuditing
@EnableAsync
public class RubixApplication {

    public static void main(String[] args) {
        SpringApplication.run(RubixApplication.class, args);
    }

}
