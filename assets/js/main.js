// BASICS
function titleCase(s) {
    return s.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}


// CURSOR
const cursor = document.getElementById('custom-cursor');

document.addEventListener('mousemove', (e) => {
    // Met à jour la position
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';

    // Si c'est le premier mouvement, on l'affiche
    if (cursor.style.opacity === "0") {
        cursor.style.opacity = "1";
    }
});

// Cache la LED quand on sort de la fenêtre
document.addEventListener('mouseleave', () => {
    cursor.style.opacity = "0";
});

// La LED réapparaît quand on rentre
document.addEventListener('mouseenter', () => {
    cursor.style.opacity = "1";
});

// Effet interactif : la LED grossit sur les liens
const links = document.querySelectorAll('a, button, .footer-handle');
links.forEach(link => {
    link.addEventListener('mouseenter', () => {
        cursor.style.transform = 'translate(-50%, -50%) scale(1.5)';
        cursor.style.backgroundColor = '#60a5fa'; // Bleu plus clair
    });
    link.addEventListener('mouseleave', () => {
        cursor.style.transform = 'translate(-50%, -50%) scale(1)';
        cursor.style.backgroundColor = '#3b82f6';
    });
});

// AUTOMATISATION
async function fetchGithubProjects() {
    const username = 'OneShot666';
    const container = document.getElementById('github-projects-container');

    const forbiddenRepos = [username.toLowerCase(), 'ourofolios', 'portfolio'];

    try {
        const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated`);

        if (response.status === 403) {                                          // 403: Quota reach
            container.innerHTML = `<p class="text-gray-500 italic text-sm col-span-full">
                Quota d'API GitHub temporairement atteint. Réessayez dans un instant.
            </p>`;
            return;
        }

        const repos = await response.json();

        if (!Array.isArray(repos)) {                                            // Check repos if an array
            console.error("Format de réponse GitHub invalide", repos);
            return;
        }

        container.innerHTML = '';

        repos.forEach(repo => {
            const isForbidden = forbiddenRepos.some(keyword => repo.name.toLowerCase().includes(keyword));
            if (repo.fork || isForbidden) return;                               // Ignore forks and unwanted projects

            // Détection du type via les "topics" de GitHub
            const topics = repo.topics || [];
            let config = { tag: 'tag-general', label: 'Informatique', color: 'yellow', bg: 'bg-yellow-950', text: 'text-yellow-300',
                hover: 'group-hover:text-yellow-400' };                         // Informatic project by default

            if (topics.includes('python')) {
                config = { tag: 'tag-python', label: 'Python', color: 'red', bg: 'bg-red-950', text: 'text-red-300',
                hover: 'group-hover:text-red-400' };
            } else if (topics.includes('unreal-engine')) {
                config = { tag: 'tag-unreal', label: 'Unreal Engine', color: 'blue', bg: 'bg-blue-950', text: 'text-blue-300',
                hover: 'group-hover:text-blue-400' };
            } else if (topics.includes('unity')) {
                config = { tag: 'tag-unity', label: 'Unity', color: 'green', bg: 'bg-green-950', text: 'text-green-300',
                hover: 'group-hover:text-green-400' };
            }

            reponame = repo.name.includes("-") ? titleCase(repo.name.replace(/-/g, ' ')) : repo.name;
            url_style = "inline-block mt-4 text-xs text-blue-400 hover:text-white transition-colors uppercase font-bold tracking-widest"

            const card = `
                <div class="project-card rounded-2xl overflow-hidden group">
                    <div class="project-media">
                        <span class="text-[10px] uppercase tracking-widest opacity-20">Git_Repo</span>
                    </div>
                    <div class="project-body">
                        <span class="tag ${config.tag}">${config.label}</span>
                        <h3 class="project-title">${reponame}</h3>
                        <p class="project-text">${repo.description || "Exploration technique sans description."}</p>
                        <a href="${repo.html_url}" target="_blank" class="${url_style}">Voir le code →</a>
                    </div>
                </div>
            `;
            container.innerHTML += card;
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des projets GitHub", error);
    }
}

// Lancer l'appel au chargement
fetchGithubProjects();

// NEURAL ANIMATION
const canvas = document.getElementById('neural-canvas');
const ctx = canvas.getContext('2d');

let particles = [];
const particleCount = 80;
const connectionDistance = 150;

// Redimensionnement
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.radius = 2;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#3b82f6';                                              // Blue
        ctx.fill();
    }
}

function init() {
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < connectionDistance) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(96, 165, 250, ${1 - distance / connectionDistance})`;
                ctx.lineWidth = 0.5;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
    requestAnimationFrame(animate);
}

init();
animate();

// FOOTER
const footer = document.getElementById('main-footer');

window.addEventListener('scroll', () => {
    // Distance parcourue + hauteur de la fenêtre
    const scrollPosition = window.innerHeight + window.scrollY;
    // Hauteur totale du contenu du site
    const threshold = document.documentElement.scrollHeight - 50; // -50px de marge

    if (scrollPosition >= threshold) {
        // On remonte le footer (translate-y-0 pour l'afficher)
        footer.classList.remove('translate-y-full');
        footer.classList.add('translate-y-[calc(100%-3rem)]');
        // Note: 3rem correspond à h-12 (la barre de titre)
    } else {
        footer.classList.add('translate-y-full');
        footer.classList.remove('translate-y-[calc(100%-3rem)]');
    }
});

// Gestion spécifique du survol quand on est en bas
footer.addEventListener('mouseenter', () => {
    const scrollPosition = window.innerHeight + window.scrollY;
    if (scrollPosition >= (document.documentElement.scrollHeight - 60)) {
        footer.classList.remove('translate-y-[calc(100%-3rem)]');
        footer.classList.add('translate-y-0');
    }
});

footer.addEventListener('mouseleave', () => {
    const scrollPosition = window.innerHeight + window.scrollY;
    if (scrollPosition >= (document.documentElement.scrollHeight - 60)) {
        footer.classList.add('translate-y-[calc(100%-3rem)]');
        footer.classList.remove('translate-y-0');
    }
});