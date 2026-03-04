/* --- UTILS --- */
const titleCase = (s) => s.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

/* --- NEURAL ANIMATION (Manager) --- */
class Particle {
    constructor(canvas) {
        this.canvas = canvas;
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.radius = 2;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > this.canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > this.canvas.height) this.vy *= -1;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#3b82f6';
        ctx.fill();
    }
}

class ParticleManager {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.count = 80;
        this.dist = 150;

        window.addEventListener('resize', () => this.resize());
        this.resize();
        this.init();
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    init() {
        for (let i = 0; i < this.count; i++) this.particles.push(new Particle(this.canvas));
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.particles.forEach((p, i) => {
            p.update();
            p.draw(this.ctx);
            for (let j = i + 1; j < this.particles.length; j++) {
                const p2 = this.particles[j];
                const d = Math.sqrt((p.x - p2.x)**2 + (p.y - p2.y)**2);
                if (d < this.dist) {
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = `rgba(96, 165, 250, ${1 - d / this.dist})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.moveTo(p.x, p.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.stroke();
                }
            }
        });
        requestAnimationFrame(() => this.animate());
    }
}

/* --- CURSOR MANAGER --- */
function initCursor() {
    const cursor = document.getElementById('custom-cursor');
    if (!cursor) return;

    document.addEventListener('mousemove', (e) => {
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;
        cursor.style.opacity = "1";
    });

    document.addEventListener('mouseleave', () => cursor.style.opacity = "0");

    // Gestion centralisée du survol (Délégation d'événements)
    document.addEventListener('mouseover', (e) => {
        if (e.target.closest('a, button, .footer-handle, [role="button"]')) {
            cursor.style.transform = 'translate(-50%, -50%) scale(2)';
            cursor.style.backgroundColor = '#60a5fa';
            cursor.style.boxShadow = '0 0 20px #60a5fa, 0 0 40px rgba(96, 165, 250, 0.6)';
        }
    });

    document.addEventListener('mouseout', (e) => {
        if (e.target.closest('a, button, .footer-handle, [role="button"]')) {
            cursor.style.transform = 'translate(-50%, -50%) scale(1)';
            cursor.style.backgroundColor = '#3b82f6';
            cursor.style.boxShadow = '0 0 15px #3b82f6, 0 0 30px rgba(59, 130, 246, 0.5)';
        }
    });
}

/* --- COMPONENTS LOADING & FOOTER --- */
function initFooterLogic() {
    const footer = document.getElementById('main-footer');
    if (!footer) return;

    const handleScroll = () => {
        const scrollHeight = document.documentElement.scrollHeight;
        const windowHeight = window.innerHeight;

        if (scrollHeight > windowHeight) {
            const atBottom = (windowHeight + window.scrollY) >= (scrollHeight - 50);
            footer.classList.toggle('translate-y-full', !atBottom);
            footer.classList.toggle('translate-y-[calc(100%-3rem)]', atBottom);
        } else {                                                                // Don't hide if page is scrollable
            footer.classList.remove('translate-y-full');
            footer.classList.add('translate-y-[calc(100%-3rem)]');
        }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    footer.addEventListener('mouseenter', () => footer.classList.replace('translate-y-[calc(100%-3rem)]', 'translate-y-0'));
    footer.addEventListener('mouseleave', () => footer.classList.replace('translate-y-0', 'translate-y-[calc(100%-3rem)]'));
}

async function loadComponent(id, path) {
    const isSubPage = window.location.pathname.includes('assets/pages/');       // Check file position in hierarchy
    const prefix = isSubPage ? '../../' : '';

    try {
        const response = await fetch(prefix + path);
        const text = await response.text();
        const container = document.getElementById(id);                          // Add content to page

        if (container) {
            container.innerHTML = text;

            if (isSubPage) {
                container.querySelectorAll('a').forEach(link => {               // Update relative links
                    const href = link.getAttribute('href');
                    if (href && !href.startsWith('http') && !href.startsWith('#')) {
                        link.setAttribute('href', prefix + href);
                    }
                });

                container.querySelectorAll('img').forEach(img => {              // Update relative images
                    const src = img.getAttribute('src');
                    if (src && !src.startsWith('http')) { img.setAttribute('src', prefix + src); }
                });
            }
        }

        if (id === 'footer-placeholder') {
            initFooterLogic();

            if (document.documentElement.scrollHeight <= window.innerHeight) {  // Don't hide footer if page is scrollable
                const footer = document.getElementById('main-footer');
                if (footer) footer.classList.replace('translate-y-full', 'translate-y-[calc(100%-3rem)]');
            }
        }
    } catch (e) { console.error(`Error loading ${path}:`, e); }
}

/* --- GITHUB API --- */
async function fetchGithubProjects() {
    const container = document.getElementById('github-projects-container');
    if (!container) return;

    const username = 'OneShot666';
    const forbidden = [username.toLowerCase(), 'ourofolios', 'portfolio'];

    try {
        const res = await fetch(`https://api.github.com/users/${username}/repos?sort=updated`);
        if (res.status === 403) {
            container.innerHTML = `<p class="text-gray-500 italic text-sm col-span-full text-center">
                Quota d'API atteint. Réessayez plus tard.</p>`;
            return;
        }
        const repos = await res.json();
        if (!Array.isArray(repos)) return;

        container.innerHTML = repos
            .filter(repo => !repo.fork && !forbidden.some(k => repo.name.toLowerCase().includes(k)))
            .map(repo => {
                const topics = repo.topics || [];
                let label = "Informatique", tagClass = "tag-general";

                if (topics.includes('python')) { label = "Python"; tagClass = "tag-python"; }
                else if (topics.includes('unreal-engine')) { label = "Unreal Engine"; tagClass = "tag-unreal"; }
                else if (topics.includes('unity')) { label = "Unity"; tagClass = "tag-unity"; }

                const name = repo.name.includes("-") ? titleCase(repo.name.replace(/-/g, ' ')) : repo.name;

                return `
                <div class="project-card group">
                    <div class="project-media">
                        <span class="text-[10px] uppercase tracking-widest opacity-20">Git_Repo</span>
                    </div>
                    <div class="project-body">
                        <span class="tag ${tagClass}">${label}</span>
                        <h3 class="project-title text-xl font-bold">${name}</h3>
                        <p class="project-text text-sm text-gray-400 mt-2">${repo.description || "Exploration technique."}</p>
                        <a href="${repo.html_url}" target="_blank"
                            class="inline-block mt-4 text-xs text-blue-400 hover:text-white font-bold tracking-widest uppercase">Voir le code →</a>
                    </div>
                </div>`;
            }).join('');
    } catch (e) { console.error("GitHub Error:", e); }
}

/* --- INITIALIZATION --- */
document.addEventListener('DOMContentLoaded', () => {
    loadComponent('header-placeholder', 'assets/templates/header.html');
    loadComponent('footer-placeholder', 'assets/templates/footer.html');

    initCursor();                                                               // Launch modules
    new ParticleManager('neural-canvas');
    fetchGithubProjects();
});
