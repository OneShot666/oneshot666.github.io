// AUTOMATISATION
async function fetchGithubProjects() {
    const username = 'OneShot666'; // <--- À MODIFIER
    const container = document.getElementById('github-projects-container');

    try {
        const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated`);
        const repos = await response.json();

        repos.forEach(repo => {
            // On ignore les forks ou les dépôts sans description si on veut rester pro
            if (repo.fork) return;

            // Détection du type via les "topics" de GitHub
            const topics = repo.topics || [];
            let config = { label: 'Informatique', color: 'yellow', bg: 'bg-yellow-950', text: 'text-yellow-300', hover: 'group-hover:text-yellow-400' };

            if (topics.includes('python')) {
                config = { label: 'Python', color: 'red', bg: 'bg-red-950', text: 'text-red-300', hover: 'group-hover:text-red-400' };
            } else if (topics.includes('unreal-engine')) {
                config = { label: 'Unreal Engine', color: 'blue', bg: 'bg-blue-950', text: 'text-blue-300', hover: 'group-hover:text-blue-400' };
            } else if (topics.includes('unity')) {
                config = { label: 'Unity', color: 'green', bg: 'bg-green-950', text: 'text-green-300', hover: 'group-hover:text-green-400' };
            }

            const card = `
                <div class="project-card rounded-2xl overflow-hidden group">
                    <div class="h-48 bg-gray-800 flex items-center justify-center border-b border-gray-700">
                        <span class="text-gray-500 font-mono text-xs">auto-generated-preview</span>
                    </div>
                    <div class="p-6">
                        <span class="inline-block ${config.bg} ${config.text} text-[10px] px-3 py-1 rounded-full uppercase font-bold mb-3">
                            ${config.label}
                        </span>
                        <h3 class="text-xl font-bold text-white ${config.hover} transition">${repo.name}</h3>
                        <p class="text-gray-400 mt-2 text-sm h-12 overflow-hidden">${repo.description || "Pas de description disponible."}</p>
                        <a href="${repo.html_url}" target="_blank" class="inline-block mt-4 text-xs text-blue-400 hover:underline">Voir le code →</a>
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
const particleCount = 80; // Ajustez pour la densité
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
        ctx.fillStyle = '#3b82f6'; // Bleu Tailwind
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