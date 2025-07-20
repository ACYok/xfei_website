document.addEventListener('DOMContentLoaded', function() {

    /* ========================================= */
    /* 1. 通用导航栏高亮 */
    /* ========================================= */
    const currentPath = window.location.pathname.split('/').pop(); // 获取当前页面文件名
    const navLinks = document.querySelectorAll('.main-nav ul li a, .mobile-menu ul li a');

    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        if (linkHref && linkHref.includes(currentPath) && currentPath !== '') {
            link.classList.add('active');
        } else if (currentPath === '' && linkHref === 'index.html') {
            link.classList.add('active'); // 首页特殊处理，如果URL是根路径
        }
    });

    /* ========================================= */
    /* 2. 移动端菜单切换 */
    /* ========================================= */
    const toggleMenuBtn = document.querySelector('.toggle-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    const header = document.querySelector('.main-header'); // 获取头部用于点击外部关闭

    if (toggleMenuBtn && mobileMenu) {
        toggleMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            toggleMenuBtn.querySelector('i').classList.toggle('fa-bars');
            toggleMenuBtn.querySelector('i').classList.toggle('fa-times'); // 切换图标
        });

        // 点击菜单外部关闭菜单
        document.addEventListener('click', (event) => {
            const isClickInsideMenu = mobileMenu.contains(event.target) || toggleMenuBtn.contains(event.target);
            if (!isClickInsideMenu && mobileMenu.classList.contains('active')) {
                mobileMenu.classList.remove('active');
                toggleMenuBtn.querySelector('i').classList.add('fa-bars');
                toggleMenuBtn.querySelector('i').classList.remove('fa-times');
            }
        });
    }

    /* ========================================= */
    /* 3. 轮播图逻辑 */
    /* ========================================= */
    const carouselSlide = document.querySelector('.carousel-slide');
    const carouselItems = document.querySelectorAll('.carousel-item');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const carouselDotsContainer = document.querySelector('.carousel-dots');

    if (carouselSlide && carouselItems.length > 0) {
        let counter = 0;
        let slideWidth = carouselItems[0].clientWidth; // 初始获取一个item的宽度
        let autoPlayInterval;

        // 更新轮播图宽度（响应式）
        function updateSlideWidth() {
            slideWidth = carouselItems[0].clientWidth;
            carouselSlide.style.transition = 'none'; // 暂停过渡，避免跳动
            carouselSlide.style.transform = 'translateX(' + (-slideWidth * counter) + 'px)';
            setTimeout(() => { // 稍后恢复过渡
                carouselSlide.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            }, 50);
        }

        // 监听窗口大小变化
        window.addEventListener('resize', updateSlideWidth);

        // 动态生成轮播点
        function createDots() {
            carouselDotsContainer.innerHTML = '';
            carouselItems.forEach((_, index) => {
                const dot = document.createElement('span');
                dot.classList.add('carousel-dot');
                if (index === counter) {
                    dot.classList.add('active');
                }
                dot.dataset.index = index;
                dot.addEventListener('click', () => {
                    counter = index;
                    updateCarousel();
                    resetAutoPlay(); // 手动点击后重置自动播放计时
                });
                carouselDotsContainer.appendChild(dot);
            });
        }

        // 更新轮播图和圆点状态
        function updateCarousel() {
            carouselSlide.style.transform = 'translateX(' + (-slideWidth * counter) + 'px)';
            updateDots();
        }

        // 更新轮播点激活状态
        function updateDots() {
            document.querySelectorAll('.carousel-dot').forEach((dot, index) => {
                dot.classList.toggle('active', index === counter);
            });
        }

        // 上一张
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                counter = (counter <= 0) ? carouselItems.length - 1 : counter - 1;
                updateCarousel();
                resetAutoPlay();
            });
        }

        // 下一张
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                counter = (counter >= carouselItems.length - 1) ? 0 : counter + 1;
                updateCarousel();
                resetAutoPlay();
            });
        }

        // 自动播放
        function startAutoPlay() {
            autoPlayInterval = setInterval(() => {
                if (nextBtn) nextBtn.click();
            }, 5000); // 每5秒切换
        }

        function resetAutoPlay() {
            clearInterval(autoPlayInterval);
            startAutoPlay();
        }

        // 鼠标悬停时暂停自动播放
        carouselSlide.addEventListener('mouseover', () => clearInterval(autoPlayInterval));
        carouselSlide.addEventListener('mouseleave', startAutoPlay);


        // 初始化
        // 确保图片加载后再计算宽度，或者在DOMContentLoaed后等待一小段时间
        if (carouselItems[0].complete) { // 如果图片已经加载完成
             updateSlideWidth();
             createDots();
             updateCarousel();
             startAutoPlay();
        } else { // 否则等待图片加载
            carouselItems[0].onload = () => {
                updateSlideWidth();
                createDots();
                updateCarousel();
                startAutoPlay();
            };
        }
    }


    /* ========================================= */
    /* 4. 计数器动画 */
    /* ========================================= */
    const counters = document.querySelectorAll('.counter');
    const counterSection = document.querySelector('.stats-counter-section');
    let countersAnimated = false; // 确保只动画一次

    const animateCounter = (entry) => {
        if (entry.isIntersecting && !countersAnimated) {
            counters.forEach(counter => {
                const target = parseInt(counter.dataset.target);
                let current = 0;
                const increment = target / 200; // 动画步长，200帧

                const updateCounter = () => {
                    if (current < target) {
                        current += increment;
                        counter.textContent = Math.ceil(current);
                        requestAnimationFrame(updateCounter);
                    } else {
                        counter.textContent = target; // 确保最终是目标值
                    }
                };
                updateCounter();
            });
            countersAnimated = true; // 标记已动画
        }
    };

    if (counterSection && counters.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => animateCounter(entry));
        }, {
            threshold: 0.5 // 当50%的元素可见时触发
        });
        observer.observe(counterSection);
    }


    /* ========================================= */
    /* 5. 手风琴 / 折叠面板 (FAQ) */
    /* ========================================= */
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            this.classList.toggle('active');
            const content = this.nextElementSibling;
            if (content.style.maxHeight) {
                content.style.maxHeight = null; // 收起
            } else {
                content.style.maxHeight = content.scrollHeight + 'px'; // 展开
            }
        });
    });


    /* ========================================= */
    /* 6. 活动列表筛选和搜索 */
    /* ========================================= */
    const filterButtons = document.querySelectorAll('.activity-filter-section .filter-btn');
    const activityItems = document.querySelectorAll('.activity-grid .activity-card');
    const activitySearchInput = document.getElementById('activity-search');
    const searchBtn = document.getElementById('search-btn');

    function filterActivities() {
        const activeFilter = document.querySelector('.filter-buttons .filter-btn.active');
        const filterValue = activeFilter ? activeFilter.dataset.filter : 'all';
        const searchTerm = activitySearchInput ? activitySearchInput.value.toLowerCase() : '';

        activityItems.forEach(item => {
            const itemClasses = item.classList;
            const itemTitle = item.dataset.title.toLowerCase();

            const matchesFilter = (filterValue === 'all' || itemClasses.contains(filterValue));
            const matchesSearch = (itemTitle.includes(searchTerm));

            if (matchesFilter && matchesSearch) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }

    if (filterButtons.length > 0 && activityItems.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                filterActivities();
            });
        });

        if (activitySearchInput) {
            activitySearchInput.addEventListener('keyup', filterActivities);
            if (searchBtn) {
                searchBtn.addEventListener('click', filterActivities);
            }
        }

        // 初始加载时执行一次筛选
        filterActivities();
    }

});