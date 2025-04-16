package com.askknightro.askknightro;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class AskKnightroApplication {

	public static void main(String[] args) {
		SpringApplication.run(AskKnightroApplication.class, args);
	}

}
