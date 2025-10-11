        document.addEventListener('DOMContentLoaded', () => {
            // スクロールアニメーション
            const faders = document.querySelectorAll('.fade-in-section');
            if (faders.length > 0) {
                const appearOptions = { threshold: 0.2, rootMargin: "0px 0px -50px 0px" };
                const appearOnScroll = new IntersectionObserver(function(entries, appearOnScroll) {
                    entries.forEach(entry => {
                        if (!entry.isIntersecting) return;
                        entry.target.classList.add('is-visible');
                        appearOnScroll.unobserve(entry.target);
                    });
                }, appearOptions);
                faders.forEach(fader => appearOnScroll.observe(fader));
            }

            // ヒーローセクションのアニメーション (ホームページ表示時のみ)
            const animationContainer = document.getElementById('animation-container');
            if (animationContainer) {
                const selection = document.getElementById('text-selection');
                const targetPrice = document.getElementById('target-price');
                const icon = document.getElementById('fake-icon');
                const popup = document.getElementById('fake-popup');
                const cursor = document.getElementById('fake-cursor');
                const browserBody = document.querySelector('.browser-body');
                const browserHeader = document.querySelector('.browser-header');

                if (!selection || !targetPrice || !icon || !popup || !cursor || !browserBody) return;

                const runAnimation = () => {
                    selection.style.transition = 'none';
                    selection.style.width = '0px';
                    popup.classList.remove('show');
                    icon.style.transform = 'scale(1)';
                    cursor.style.transition = 'none';
                    cursor.style.opacity = '0';
                    cursor.style.transform = 'scale(1)';

                    const priceRect = targetPrice.getBoundingClientRect();
                    const bodyRect = browserBody.getBoundingClientRect();
                    const headerRect = browserHeader.getBoundingClientRect();
                    const iconRect = icon.getBoundingClientRect();

                    const priceStartX = priceRect.left - bodyRect.left;
                    const priceStartY = priceRect.top - bodyRect.top + (priceRect.height / 2);
                    const iconTargetX = iconRect.left - bodyRect.left + (iconRect.width / 2);
                    const iconTargetY = (headerRect.top - bodyRect.top) + (headerRect.height / 2);

                    selection.style.left = `${priceStartX}px`;
                    selection.style.top = `${priceRect.top - bodyRect.top}px`;
                    selection.style.height = `${priceRect.height}px`;

                    setTimeout(() => {
                        cursor.style.left = `${priceStartX - 10}px`;
                        cursor.style.top = `${priceStartY - 10}px`;
                        cursor.style.opacity = '1';
                        cursor.style.transition = 'left 1s ease, top 1s ease, opacity 0.5s ease';
                    }, 500);
                    setTimeout(() => {
                        selection.style.transition = 'width 0.8s ease-out';
                        selection.style.width = `${priceRect.width}px`;
                        cursor.style.transition = 'left 0.8s ease-out';
                        cursor.style.left = `${priceStartX + priceRect.width - 10}px`;
                    }, 1600);
                    setTimeout(() => {
                        cursor.style.transition = 'left 0.7s ease-in-out, top 0.7s ease-in-out';
                        cursor.style.left = `${iconTargetX}px`;
                        cursor.style.top = `${iconTargetY}px`;
                    }, 2600);
                    setTimeout(() => {
                        cursor.style.transform = 'scale(0.8)';
                        icon.style.transform = 'scale(1.15)';
                        popup.classList.add('show');
                    }, 3400);
                    setTimeout(() => {
                        cursor.style.transform = 'scale(1)';
                        icon.style.transform = 'scale(1)';
                        popup.classList.remove('show');
                    }, 4800);
                    setTimeout(() => {
                        cursor.style.opacity = '0';
                    }, 5300);
                };

                const heroObserver = new IntersectionObserver((entries) => {
                    let animationInterval;
                    if(entries[0].isIntersecting){
                        runAnimation();
                        animationInterval = setInterval(runAnimation, 5800);
                    } else {
                        clearInterval(animationInterval);
                    }
                });
                heroObserver.observe(animationContainer);
            }
        });