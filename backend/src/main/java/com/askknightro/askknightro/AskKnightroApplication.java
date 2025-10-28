package com.askknightro.askknightro;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(exclude = {
    org.springframework.ai.autoconfigure.vectorstore.milvus.MilvusVectorStoreAutoConfiguration.class
})
public class AskKnightroApplication {

	public static void main(String[] args) {
		SpringApplication.run(AskKnightroApplication.class, args);
	}
}
