document.addEventListener('DOMContentLoaded', () => {
    // Animate project cards on scroll
    gsap.registerPlugin(ScrollTrigger);
    
    // GSAP Smooth Scroll
    const content = document.querySelector('.content');
    gsap.to(content, {
        y: () => -(content.clientHeight - window.innerHeight),
        ease: "none",
        scrollTrigger: {
            trigger: ".scroll-container",
            pin: true,
            scrub: 1,
            end: () => `+=${content.clientHeight - window.innerHeight}`,
        }
    });

    const cursorDot = document.querySelector('.cursor-dot');
    let mouseX = 0;
    let mouseY = 0;
    let dotX = 0;
    let dotY = 0;
    const delay = 0.15;

    // Create a canvas for the glowing trail
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    document.body.insertBefore(canvas, document.body.firstChild);
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.zIndex = '-1'; // Place it behind all other content
    let canvasWidth = window.innerWidth;
    let canvasHeight = window.innerHeight;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    let trail = [];

    window.addEventListener('resize', () => {
        canvasWidth = window.innerWidth;
        canvasHeight = window.innerHeight;
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
    });

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    gsap.ticker.add(() => {
        // Dot movement
        dotX += (mouseX - dotX) * delay;
        dotY += (mouseY - dotY) * delay;
        cursorDot.style.left = `${dotX}px`;
        cursorDot.style.top = `${dotY}px`;

        // Trail animation
        trail.push({ x: mouseX, y: mouseY });
        if (trail.length > 30) {
            trail.shift();
        }

        context.clearRect(0, 0, canvasWidth, canvasHeight);

        for (let i = 0; i < trail.length; i++) {
            const point = trail[i];
            const ratio = i / trail.length;
            
            context.beginPath();
            context.arc(point.x, point.y, 15 * ratio, 0, Math.PI * 2, false);
            context.fillStyle = `rgba(0, 150, 255, ${0.1 * ratio})`;
            context.shadowColor = `rgba(0, 150, 255, ${0.5 * ratio})`;
            context.shadowBlur = 20;
            context.fill();
        }
    });

    gsap.utils.toArray('.project').forEach(project => {
        gsap.fromTo(project,
            {
                opacity: 0,
                y: 100
            },
            {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: project,
                    start: 'top 85%',
                    toggleActions: 'play none none none',
                }
            }
        );
    });
}); 