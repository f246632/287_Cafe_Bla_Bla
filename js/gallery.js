/* ============================================
   GALLERY & LIGHTBOX FUNCTIONALITY
   Image Gallery with Lightbox Modal
   ============================================ */

// ===== GALLERY INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    initGallery();
    initLightbox();
});

// ===== GALLERY SETUP =====
function initGallery() {
    const galleryItems = document.querySelectorAll('.gallery-item');

    galleryItems.forEach((item, index) => {
        // Add staggered animation delay
        item.style.transitionDelay = `${index * 0.1}s`;

        // Add click event to open lightbox
        item.addEventListener('click', () => {
            openLightbox(index);
        });

        // Add keyboard accessibility
        item.setAttribute('tabindex', '0');
        item.setAttribute('role', 'button');
        item.setAttribute('aria-label', `View image ${index + 1}`);

        item.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openLightbox(index);
            }
        });
    });
}

// ===== LIGHTBOX =====
let currentImageIndex = 0;
let galleryImages = [];

function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const closeBtn = document.getElementById('lightboxClose');
    const prevBtn = document.getElementById('lightboxPrev');
    const nextBtn = document.getElementById('lightboxNext');

    if (!lightbox) return;

    // Collect all gallery images
    const galleryItems = document.querySelectorAll('.gallery-item img');
    galleryImages = Array.from(galleryItems).map(img => ({
        src: img.src,
        alt: img.alt
    }));

    // Close lightbox
    closeBtn?.addEventListener('click', closeLightbox);

    // Close on background click
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Navigation
    prevBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        showPreviousImage();
    });

    nextBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        showNextImage();
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;

        switch(e.key) {
            case 'Escape':
                closeLightbox();
                break;
            case 'ArrowLeft':
                showPreviousImage();
                break;
            case 'ArrowRight':
                showNextImage();
                break;
        }
    });

    // Touch/swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    lightboxImg?.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightboxImg?.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left - next image
                showNextImage();
            } else {
                // Swipe right - previous image
                showPreviousImage();
            }
        }
    }
}

function openLightbox(index) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');

    if (!lightbox || !lightboxImg) return;

    currentImageIndex = index;

    // Set image
    lightboxImg.src = galleryImages[index].src;
    lightboxImg.alt = galleryImages[index].alt;

    // Show lightbox
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Update navigation buttons visibility
    updateNavigationButtons();

    // Preload adjacent images
    preloadAdjacentImages(index);
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');

    if (!lightbox) return;

    lightbox.classList.remove('active');
    document.body.style.overflow = '';
}

function showPreviousImage() {
    currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
    updateLightboxImage();
}

function showNextImage() {
    currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
    updateLightboxImage();
}

function updateLightboxImage() {
    const lightboxImg = document.getElementById('lightboxImg');

    if (!lightboxImg) return;

    // Add fade effect
    lightboxImg.style.opacity = '0';

    setTimeout(() => {
        lightboxImg.src = galleryImages[currentImageIndex].src;
        lightboxImg.alt = galleryImages[currentImageIndex].alt;
        lightboxImg.style.opacity = '1';
    }, 150);

    updateNavigationButtons();
    preloadAdjacentImages(currentImageIndex);
}

function updateNavigationButtons() {
    const prevBtn = document.getElementById('lightboxPrev');
    const nextBtn = document.getElementById('lightboxNext');

    if (!prevBtn || !nextBtn) return;

    // Show/hide buttons based on position
    // For now, we'll keep them always visible as we have circular navigation
    prevBtn.style.opacity = '1';
    nextBtn.style.opacity = '1';
}

function preloadAdjacentImages(index) {
    // Preload previous and next images for smoother navigation
    const prevIndex = (index - 1 + galleryImages.length) % galleryImages.length;
    const nextIndex = (index + 1) % galleryImages.length;

    [prevIndex, nextIndex].forEach(i => {
        const img = new Image();
        img.src = galleryImages[i].src;
    });
}

// ===== LAZY LOADING FOR GALLERY =====
function initGalleryLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const src = img.dataset.src;

                    if (src) {
                        img.src = src;
                        img.removeAttribute('data-src');
                        img.classList.add('loaded');
                    }

                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px'
        });

        document.querySelectorAll('.gallery-item img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// ===== IMAGE LOADING ERROR HANDLING =====
document.querySelectorAll('.gallery-item img').forEach(img => {
    img.addEventListener('error', function() {
        this.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect fill="%23f0f0f0" width="400" height="300"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-family="sans-serif" font-size="18"%3EBild nicht verfügbar%3C/text%3E%3C/svg%3E';
        this.alt = 'Bild konnte nicht geladen werden';
    });
});

// ===== EXPORT FOR TESTING =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initGallery,
        initLightbox,
        openLightbox,
        closeLightbox,
        showPreviousImage,
        showNextImage
    };
}
