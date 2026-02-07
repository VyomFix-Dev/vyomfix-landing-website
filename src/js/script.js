document.addEventListener('DOMContentLoaded', () => {

    // SCROLL REVEAL EFFECT
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });

    reveals.forEach(el => observer.observe(el));

    // THEME SWITCHER LOGIC
    const themeToggle = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme') || 'light';

    document.documentElement.setAttribute('data-theme', currentTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const theme = document.documentElement.getAttribute('data-theme');
            const newTheme = theme === 'light' ? 'dark' : 'light';

            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    // HEADER SCROLL STATE
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.padding = '15px 0';
        } else {
            header.style.padding = '20px 0';
        }
    });

    // MOBILE MENU TOGGLE
    const mobileToggle = document.querySelector('.mobile-toggle');
    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            // Simplified for enterprise demo
            console.log('Mobile menu activated');
            alert('Navigation menu is optimized for desktop enterprise oversight. Mobile routes are available for read-only access.');
        });
    }

    // STATS COUNTER IF PRESENT
    const counters = document.querySelectorAll('.stat-val');
    if (counters.length > 0) {
        const countStats = () => {
            counters.forEach(counter => {
                const target = parseFloat(counter.getAttribute('data-target'));
                const current = parseFloat(counter.innerText || 0);
                const increment = target / 100;

                if (current < target) {
                    counter.innerText = (current + increment).toFixed(1).replace('.0', '');
                    setTimeout(countStats, 20);
                } else {
                    counter.innerText = target;
                }
            });
        };

        const statsSection = document.querySelector('.stats');
        if (statsSection) {
            const statsObserver = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    countStats();
                    statsObserver.unobserve(statsSection);
                }
            });
            statsObserver.observe(statsSection);
        }
    }

    // SCROLL TO CONTENT FUNCTION
    window.scrollDown = () => {
        window.scrollTo({
            top: window.innerHeight * 0.9,
            behavior: 'smooth'
        });
    };

    // SECTION JUMP SCROLLING
    let isScrolling = false;
    const scrollSections = [
        document.getElementById('compliance'),
        document.getElementById('verticals'),
        document.getElementById('organization'),
        document.getElementById('terminal'),
        document.querySelector('footer')
    ].filter(el => el);

    window.addEventListener('wheel', (e) => {
        if (isScrolling) return;

        const direction = e.deltaY > 0 ? 1 : -1;
        let currentIndex = -1;

        // Find current section based on scroll position
        const scrollPos = window.scrollY + 100; // Offset for header
        scrollSections.forEach((section, index) => {
            if (scrollPos >= section.offsetTop && scrollPos < section.offsetTop + section.offsetHeight) {
                currentIndex = index;
            }
        });

        if (currentIndex === -1) return;

        const nextIndex = currentIndex + direction;
        if (nextIndex >= 0 && nextIndex < scrollSections.length) {
            e.preventDefault();
            isScrolling = true;

            scrollSections[nextIndex].scrollIntoView({ behavior: 'smooth' });

            setTimeout(() => {
                isScrolling = false;
            }, 1000); // Lock for 1s to allow animation
        }
    }, { passive: false });

    // Keep the click trigger for standard UI elements
    document.querySelectorAll('.scroll-trigger').forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            const currentSection = trigger.closest('section');
            const nextSection = currentSection ? currentSection.nextElementSibling : null;

            if (nextSection) {
                nextSection.scrollIntoView({ behavior: 'smooth' });
            } else {
                const footer = document.querySelector('footer');
                if (footer) footer.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // HERO VIDEO RANDOMIZER
    const heroVideo = document.getElementById('hero-video');
    if (heroVideo) {
        const videoSources = [
            'assets/video/v1.mp4',
            'assets/video/v2.mp4',
            'assets/video/v3.mp4'
        ];

        let lastVideoIndex = -1;

        const playRandomVideo = () => {
            let nextIndex;
            // Prevent playing same video twice in a row for better variety
            if (videoSources.length > 1) {
                do {
                    nextIndex = Math.floor(Math.random() * videoSources.length);
                } while (nextIndex === lastVideoIndex);
            } else {
                nextIndex = 0;
            }

            lastVideoIndex = nextIndex;
            heroVideo.src = videoSources[nextIndex];
            heroVideo.load();
            heroVideo.play().catch(e => console.log("Video autoplay blocked or failed:", e));
        };

        // Initial play
        playRandomVideo();

        // Play next random video when current one ends
        heroVideo.addEventListener('ended', playRandomVideo);
    }

    // ANTIGRAVITY CANVAS SYSTEM
    const canvas = document.getElementById('antigravity-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        const particleCount = 100;
        const connectionDistance = 150;
        const mouseRepelRadius = 150;
        let mouse = { x: null, y: null };

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });
        window.addEventListener('mouseleave', () => {
            mouse.x = null;
            mouse.y = null;
        });

        class Particle {
            constructor() {
                this.init();
            }

            init() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.size = Math.random() * 2 + 1;
            }

            update() {
                // Movement
                this.x += this.vx;
                this.y += this.vy;

                // Mouse interaction (Repulsion)
                if (mouse.x !== null) {
                    const dx = mouse.x - this.x;
                    const dy = mouse.y - this.y;
                    const distance = Math.hypot(dx, dy);

                    if (distance < mouseRepelRadius) {
                        const angle = Math.atan2(dy, dx);
                        const force = (mouseRepelRadius - distance) / mouseRepelRadius;
                        this.x -= Math.cos(angle) * force * 2;
                        this.y -= Math.sin(angle) * force * 2;
                    }
                }

                // Bounce off edges
                if (this.x < 0) this.x = canvas.width;
                if (this.x > canvas.width) this.x = 0;
                if (this.y < 0) this.y = canvas.height;
                if (this.y > canvas.height) this.y = 0;
            }

            draw() {
                const color = getComputedStyle(document.documentElement).getPropertyValue('--brand-primary').trim();
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        const initParticles = () => {
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        };

        const drawConnections = () => {
            const color = getComputedStyle(document.documentElement).getPropertyValue('--brand-primary').trim();
            ctx.strokeStyle = color;
            ctx.lineWidth = 0.5;

            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.hypot(dx, dy);

                    if (distance < connectionDistance) {
                        ctx.globalAlpha = 1 - (distance / connectionDistance);
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
            ctx.globalAlpha = 1;
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach(p => {
                p.update();
                p.draw();
            });

            drawConnections();
            requestAnimationFrame(animate);
        };

        resize();
        initParticles();
        animate();
    }
});
