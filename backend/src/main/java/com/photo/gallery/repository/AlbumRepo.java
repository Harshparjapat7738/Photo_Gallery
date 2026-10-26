package com.photo.gallery.repository;

import com.photo.gallery.model.Album;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlbumRepo extends JpaRepository<Album, String> {
    List<Album> findByUserId(String userId);
}
