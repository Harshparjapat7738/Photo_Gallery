package com.photo.gallery.controller;

import com.photo.gallery.model.Photo;
import com.photo.gallery.service.PhotoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/jsonplaceholder.typicode.com/photo")
@RequiredArgsConstructor
public class PhotoController {

    private final PhotoService photoService;

    // Get all photos in an album
    @GetMapping("/album/{albumId}")
    public ResponseEntity<List<Photo>> getPhotosByAlbum(@PathVariable String albumId) {
        return ResponseEntity.ok(photoService.getPhotosByAlbum(albumId));
    }

    // Get Photo by id
    @GetMapping("/{id}")
    public ResponseEntity<Photo> getPhotoById(@PathVariable String id) {
        return ResponseEntity.ok(photoService.getPhotoById(id));
    }
}
