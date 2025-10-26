//package com.askknightro.askknightro.controller;
//
//import com.askknightro.askknightro.service.CollectionService;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//@RestController
//@RequestMapping("/api/collections")
//public class CollectionController {
//    private final CollectionService collectionService;
//    public CollectionController(CollectionService collectionService) {
//        this.collectionService = collectionService;
//    }
//
//   @PostMapping
//    public ResponseEntity<String> createCollection( @RequestParam String name) {
//        collectionService.createCollection(name);
//        return ResponseEntity.ok("Collection created: " + name);
//    }
//}
