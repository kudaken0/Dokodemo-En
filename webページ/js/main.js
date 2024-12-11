document.addEventListener("DOMContentLoaded", () => {
    const features = document.querySelectorAll(".feature");
    const ctaBtn = document.querySelector(".cta-btn");

    // Fade-in effect for each feature
    features.forEach((feature, index) => {
        setTimeout(() => {
            feature.style.opacity = "1";
        }, index * 300);
    });

    // Click fade-out effect for button
    ctaBtn.addEventListener("click", () => {
        ctaBtn.style.transition = "opacity 0.5s ease";
        ctaBtn.style.opacity = "0";
        setTimeout(() => {
            ctaBtn.style.opacity = "1";
        }, 500);
    });
});

// JavaScript for slider functionality
let currentIndex = 0;
const sliderWrapper = document.querySelector('.slider-wrapper');
const images = document.querySelectorAll('.usage-image');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');
const description = document.querySelector('.usage-description');

const descriptions = [
    'Step 1',
    'Step 2',
    'Step 3'
];

description.textContent = descriptions[currentIndex];

function updateSlider() {
    sliderWrapper.style.transform = `translateX(-${currentIndex * 100}%)`;
    description.textContent = descriptions[currentIndex];
}

prevBtn.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    updateSlider();
});

nextBtn.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % images.length;
    updateSlider();
});