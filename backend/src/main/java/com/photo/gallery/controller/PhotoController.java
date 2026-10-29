package com.photo.gallery.controller;

import com.photo.gallery.model.Photo;
import com.photo.gallery.service.PhotoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/jsonplaceholder.typicode.com/photo")
@RequiredArgsConstructor
public class PhotoController {

    private final PhotoService photoService;

    /** Returns photos belonging to the requested album. */
    @GetMapping("/album/{albumId}")
    public ResponseEntity<List<Photo>> getPhotosByAlbum(@PathVariable String albumId) {
        return ResponseEntity.ok(photoService.getPhotosByAlbum(albumId));
    }

    /** Returns one photo, or a 404 response when it does not exist. */
    @GetMapping("/{id}")
    public ResponseEntity<Photo> getPhotoById(@PathVariable String id) {
        return ResponseEntity.ok(photoService.getPhotoById(id));
    }
}
