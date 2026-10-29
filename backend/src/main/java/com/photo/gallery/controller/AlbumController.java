package com.photo.gallery.controller;

import com.photo.gallery.model.Album;
import com.photo.gallery.service.AlbumService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/jsonplaceholder.typicode.com/album")
@RequiredArgsConstructor
public class AlbumController {

    private final AlbumService albumService;

    // Get all albums
    @GetMapping
    public ResponseEntity<List<Album>> getAllAlbums(){
        return ResponseEntity.ok(albumService.getAllAlbums());
    }

    // Get albums by user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Album>> getAlbumsByUser(@PathVariable String userId){
        return ResponseEntity.ok(albumService.getAlbumsByUser(userId));
    }

    // Get Album by id
    @GetMapping("/{id}")
    public ResponseEntity<Album> getAlbumById(@PathVariable String id){
        return ResponseEntity.ok(albumService.getAlbumById(id));
    }
}
