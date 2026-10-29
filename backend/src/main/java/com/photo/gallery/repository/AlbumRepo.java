package com.photo.gallery.repository;

import com.photo.gallery.model.Album;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AlbumRepo extends JpaRepository<Album, String> {
    List<Album> findByUserId(String userId);
}
