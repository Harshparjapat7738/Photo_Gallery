package com.photo.gallery.controller;

import com.photo.gallery.model.Album;
import com.photo.gallery.security.SessionAuth;
import com.photo.gallery.service.AlbumService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/jsonplaceholder.typicode.com/album")
@RequiredArgsConstructor
public class AlbumController {

    private final AlbumService albumService;

    // Create Album
    @PostMapping
    public ResponseEntity<Album> createAlbum(@RequestBody Album album, HttpSession session){
        album.setUserId(SessionAuth.requireUserId(session));
        return ResponseEntity.status(HttpStatus.CREATED).body(albumService.createAlbum(album));
    }

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

    // Update Album
    @PutMapping("/{id}")
    public ResponseEntity<Album> updateAlbum(
            @PathVariable String id,
            @RequestBody Album album,
            HttpSession session){
        return ResponseEntity.ok(albumService.updateAlbum(id, album, SessionAuth.requireUserId(session)));
    }

    // Delete Album
    @DeleteMapping("/{id}")
    public ResponseEntity<Album> deleteAlbum(@PathVariable String id, HttpSession session){
        return ResponseEntity.ok(albumService.deleteAlbum(id, SessionAuth.requireUserId(session)));
    }
}
