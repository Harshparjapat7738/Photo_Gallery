package com.photo.gallery.service;

import com.photo.gallery.model.Album;
import com.photo.gallery.repository.PhotoRepo;
import com.photo.gallery.repository.AlbumRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class AlbumService {

    @Autowired
    private AlbumRepo albumRepo;

    @Autowired
    private PhotoRepo photoRepo;

    // Create Album
    public Album createAlbum(Album album) {
        album.setCreatedAt(Instant.now());
        return albumRepo.save(album);
    }

    // Get all albums
    public List<Album> getAllAlbums() {
        return albumRepo.findAll();
    }

    // Get albums by user (identifies album ownership)
    public List<Album> getAlbumsByUser(String userId) {
        return albumRepo.findByUserId(userId);
    }

    // Get Album by id
    public Album getAlbumById(String albumId) {
        return albumRepo.findById(albumId).orElse(null);
    }

    public Album getOwnedAlbum(String albumId) {
        Album album = albumRepo.findById(albumId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Album not found"));
        return album;
    }

    public Album updateAlbum(String albumId, Album updatedAlbum) {
        Album existingAlbum = getOwnedAlbum(albumId);

        existingAlbum.setAlbumName(updatedAlbum.getAlbumName());
        existingAlbum.setDescription(updatedAlbum.getDescription());

        return albumRepo.save(existingAlbum);
    }

    // Delete Album
    public Album deleteAlbum(String albumId) {
        Album album = getOwnedAlbum(albumId);
        photoRepo.deleteByAlbumId(albumId);
        albumRepo.delete(album);
        return album;
    }
}
