window.addEventListener('scroll', function() {
  const header = document.getElementById('main-header');
  // 20px以上スクロールしたら影をつける
  if (window.scrollY > 20) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

document.querySelectorAll('.faq-header').forEach(header => {
  header.addEventListener('click', () => {
    const parent = header.parentElement;
    const isActive = parent.classList.contains('active');
    const icon = header.querySelector('.faq-icon');

    // --- すべてリセット ---
    document.querySelectorAll('.faq-item').forEach(item => {
      item.classList.remove('active');
      item.querySelector('.faq-content').style.maxHeight = null;
      item.querySelector('.faq-icon').classList.replace('fa-times', 'fa-plus');
    });

    // ---　クリックされたものが元々閉じていたら開く ---
    if (!isActive) {
      parent.classList.add('active');
      const content = parent.querySelector('.faq-content');
      content.style.maxHeight = content.scrollHeight + "px";
      icon.classList.replace('fa-plus', 'fa-times');
    }
  });
});

document.addEventListener('DOMContentLoaded', function() {
  // URLパラメータを取得
  const urlParams = new URLSearchParams(window.location.search);
  

  if (urlParams.get('config') === 'thank') {
    const normalContent = document.getElementById('normal-content');
    const thankContent = document.getElementById('thank-you-content');
    
    if (normalContent && thankContent) {
      normalContent.style.display = 'none';
      thankContent.style.display = 'block';
    }
  }
});