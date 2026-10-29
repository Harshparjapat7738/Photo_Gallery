package com.photo.gallery.config;

import com.photo.gallery.model.Album;
import com.photo.gallery.model.Photo;
import com.photo.gallery.model.User;
import com.photo.gallery.repository.AlbumRepo;
import com.photo.gallery.repository.PhotoRepo;
import com.photo.gallery.repository.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class DemoDataInitializer implements CommandLineRunner {

    private static final int ALBUMS_PER_USER = 3;
    private static final int PHOTOS_PER_ALBUM = 15;
    private static final List<String> ALBUM_NAMES = List.of(
            "Golden Hour",
            "Weekend Getaways",
            "Everyday Moments"
    );
    private static final List<String> IMAGE_FILES = List.of(
            "2023-tata-harrier-rendering.jpg",
            "2025-tata-sierra-1068x600.jpg",
            "53.webp",
            "close-up-high-angle-view-of-hybrid-tea-rose-604387089-58194c195f9b581c0bc5ff06.jpg",
            "download (1).webp",
            "download (10).webp",
            "download (11).webp",
            "download (2).webp",
            "download (3).webp",
            "download (4).webp",
            "download (5).webp",
            "download (6).webp",
            "download (7).webp",
            "download (8).webp",
            "download (9).webp",
            "download.webp",
            "gettyimages-1435854570-612x612.jpg",
            "gettyimages-1497187093-612x612.jpg",
            "gettyimages-2158485512-612x612.jpg",
            "gettyimages-2159569055-612x612.jpg",
            "gettyimages-2159832985-612x612.jpg",
            "gettyimages-2159845151-612x612.jpg",
            "gettyimages-2160280059-612x612.jpg",
            "gettyimages-2263696824-612x612.jpg",
            "gettyimages-2265444136-612x612.jpg",
            "highly-realistic-image-depicting-interior-modern-supermarket-scene-includes-aisles-filled-various-products-such-as-322656706.webp",
            "hybrid-tea-types-of-roses-in-india.jpg",
            "left-front-three-quarter1.avif",
            "OIF.webp",
            "OIP (1).webp",
            "OIP (10).webp",
            "OIP (11).webp",
            "OIP (12).webp",
            "OIP (13).webp",
            "OIP (14).webp",
            "OIP (15).webp",
            "OIP (16).webp",
            "OIP (17).webp",
            "OIP (18).webp",
            "OIP (19).webp",
            "OIP (2).webp",
            "OIP (20).webp",
            "OIP (21).webp",
            "OIP (22).webp",
            "OIP (3).webp",
            "OIP (4).webp",
            "OIP (5).webp",
            "OIP (6).webp",
            "OIP (7).webp",
            "OIP (8).webp",
            "OIP (9).webp",
            "OIP.webp",
            "roses-2888589_1920.jpg",
            "tata-harrier-electric-specs-range-suv-3.jpg",
            "tata.jpg",
            "th.webp"
    );
    private static final List<SeedUser> SEED_USERS = List.of(
            new SeedUser("Avery Stone", "avery.stone", "avery.stone@demo.example"),
            new SeedUser("Jordan Lee", "jordan.lee", "jordan.lee@demo.example"),
            new SeedUser("Morgan Patel", "morgan.patel", "morgan.patel@demo.example"),
            new SeedUser("Riley Chen", "riley.chen", "riley.chen@demo.example"),
            new SeedUser("Taylor Brooks", "taylor.brooks", "taylor.brooks@demo.example")
    );

    private final UserRepo userRepo;
    private final AlbumRepo albumRepo;
    private final PhotoRepo photoRepo;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        List<String> randomizedImages = new ArrayList<>(IMAGE_FILES);
        Collections.shuffle(randomizedImages);
        RandomImagePicker imagePicker = new RandomImagePicker(randomizedImages);

        for (SeedUser seedUser : SEED_USERS) {
            User user = userRepo.findByEmailIgnoreCase(seedUser.email());
            if (user == null) {
                user = new User();
                user.setName(seedUser.name());
                user.setUserName(seedUser.userName());
                user.setEmail(seedUser.email());
                user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
                user.setProfilePicture(imagePicker.next());
                user = userRepo.save(user);
            } else if (!isSeedImage(user.getProfilePicture())) {
                user.setProfilePicture(imagePicker.next());
                user = userRepo.save(user);
            }

            List<Album> userAlbums = albumRepo.findByUserId(user.getUserId());
            for (int albumIndex = 0; albumIndex < ALBUMS_PER_USER; albumIndex++) {
                String albumName = ALBUM_NAMES.get(albumIndex);
                Album album = null;
                for (Album existing : userAlbums) {
                    if (albumName.equals(existing.getAlbumName())) {
                        album = existing;
                        break;
                    }
                }
                if (album == null) {
                    album = createAlbum(user, albumName);
                    userAlbums.add(album);
                }
            }

            for (Album album : userAlbums) {
                ensureAlbumPhotos(album, imagePicker);
            }
        }
    }

    private void ensureAlbumPhotos(Album album, RandomImagePicker imagePicker) {
        List<Photo> albumPhotos = photoRepo.findByAlbumId(album.getAlbumId());
        for (Photo photo : albumPhotos) {
            if (!isSeedImage(photo.getImageUrl())) {
                photo.setImageUrl(imagePicker.next());
                photo.setUpdatedAt(Instant.now());
                photoRepo.save(photo);
            }
        }
        for (int photoIndex = albumPhotos.size(); photoIndex < PHOTOS_PER_ALBUM; photoIndex++) {
            Photo photo = new Photo();
            photo.setAlbumId(album.getAlbumId());
            photo.setImageTitle(album.getAlbumName() + " " + (photoIndex + 1));
            photo.setImageDescription("A sample photo from the community gallery.");
            photo.setImageUrl(imagePicker.next());
            photo.setSortOrder(photoIndex + 1);
            photo.setCreatedAt(Instant.now());
            photo.setUpdatedAt(Instant.now());
            albumPhotos.add(photoRepo.save(photo));
        }

        album.setPhotoCount(albumPhotos.size());
        album.setCoverImage(albumPhotos.get(0).getImageUrl());
        albumRepo.save(album);
    }

    private Album createAlbum(User user, String albumName) {
        Album album = new Album();
        album.setAlbumName(albumName);
        album.setDescription("A collection shared by " + user.getName() + ".");
        album.setUserId(user.getUserId());
        album.setCreatedAt(Instant.now());
        album.setPhotoCount(0);
        return albumRepo.save(album);
    }

    private String imageUrl(String filename) {
        return "/images/" + filename;
    }

    private boolean isSeedImage(String imageUrl) {
        return imageUrl != null && IMAGE_FILES.stream().anyMatch(filename -> imageUrl.equals(imageUrl(filename)));
    }

    private record SeedUser(String name, String userName, String email) {
    }

    private static final class RandomImagePicker {
        private final List<String> filenames;
        private int index;

        private RandomImagePicker(List<String> filenames) {
            this.filenames = filenames;
        }

        private String next() {
            return "/images/" + filenames.get(index++ % filenames.size());
        }
    }
}
