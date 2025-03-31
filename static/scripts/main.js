document.addEventListener('DOMContentLoaded', () => {
    initUpload();
    initSimulator();

    // Ensure nav animation starts
    const nav = document.querySelector('header nav');
    if (nav) {
        nav.style.opacity = '0';
        setTimeout(() => {
            nav.style.opacity = '1';
        }, 100);
    } else {
        console.error('Navigation element not found');
    }

    // Carousel navigation
    const carouselTrack = document.querySelector('.carousel-track');
    const leftArrow = document.querySelector('.left-arrow');
    const rightArrow = document.querySelector('.right-arrow');

    if (!carouselTrack || !leftArrow || !rightArrow) {
        console.error('Carousel elements not found:', { carouselTrack, leftArrow, rightArrow });
        return;
    }

    const cardWidth = 360; // Card width (340px) + margin (10px each side)
    const visibleCards = 3; // Show 3 cards at a time
    const totalCards = carouselTrack.children.length; // 5 cards
    let currentPosition = 0;
    const maxScroll = (totalCards - visibleCards) * cardWidth; // Total scrollable distance: 720px

    leftArrow.addEventListener('click', () => {
        if (currentPosition < 0) {
            currentPosition += cardWidth;
            currentPosition = Math.min(0, currentPosition);
            carouselTrack.style.transform = `translateX(${currentPosition}px)`;
            console.log('Left arrow clicked, new position:', currentPosition);
        }
    });

    rightArrow.addEventListener('click', () => {
        if (currentPosition > -maxScroll) {
            currentPosition -= cardWidth;
            currentPosition = Math.max(-maxScroll, currentPosition);
            carouselTrack.style.transform = `translateX(${currentPosition}px)`;
            console.log('Right arrow clicked, new position:', currentPosition);
        }
    });
});

