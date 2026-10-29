package com.photo.gallery.controller;

import com.photo.gallery.model.Album;
import com.photo.gallery.service.AlbumService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/jsonplaceholder.typicode.com/album")
@RequiredArgsConstructor
public class AlbumController {

    private final AlbumService albumService;

    /** Returns all albums. */
    @GetMapping
    public ResponseEntity<List<Album>> getAllAlbums() {
        return ResponseEntity.ok(albumService.getAllAlbums());
    }

    /** Returns albums belonging to the requested user. */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Album>> getAlbumsByUser(@PathVariable String userId) {
        return ResponseEntity.ok(albumService.getAlbumsByUser(userId));
    }

    /** Returns one album, or a 404 response when it does not exist. */
    @GetMapping("/{id}")
    public ResponseEntity<Album> getAlbumById(@PathVariable String id) {
        return ResponseEntity.ok(albumService.getAlbumById(id));
    }
}
