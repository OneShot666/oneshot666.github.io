/* --- UTILS --- */
const titleCase = (s) => s.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
let modalAutoPlayInterval = null;
let currentOpenRepo = null; // Pour savoir quel projet est ouvert

const USER_CONFIG = {
    username: "OneShot666",
    links: {
        github: "https://github.com/OneShot666",
        linkedin: "https://www.linkedin.com/in/nathan-mir-05b404209/",
        itchio: "https://oneshot666.itch.io/",
        email: "mailto:mir.nathan42@gmail.com"
    },
    animationSettings: {
        cardDelay: 4000,    // Délai pour les cartes (en ms)
        modalDelay: 6000,    // Délai pour la modale (en ms)
        transitionDelay: 800    // Temps de fondu entre les images (en ms)
    },
    projectSettings: {
        "Space-Defender": { type: "iframe", url: "https://itch.io/embed-upload/17017344?color=010046" },
//        "Space-Invader": { type: "iframe", url: "https://oneshot666.github.io/Space-Invader/" },
//        "Nom-Du-Repo-Web": { type: "external" }, // Utilise le lien 'homepage' de GitHub
    },
};

async function checkGithubPages(repoName) {
    const url = `https://${USER_CONFIG.username.toLowerCase()}.github.io/${repoName}/`;
    try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok ? url : null;
    } catch (e) {
        return null;
    }
}

const preloadImage = (url) => {                                                 // Preload image in cache
    const img = new Image();
    img.src = url;
};

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
        if (e.target.closest('a, button, .footer-handle, [role="button"], #back-to-top')) {
            cursor.style.transform = 'translate(-50%, -50%) scale(1)';
            cursor.style.backgroundColor = '#3b82f6';
            cursor.style.boxShadow = '0 0 15px #3b82f6, 0 0 30px rgba(59, 130, 246, 0.5)';
        }
    });

    document.addEventListener('keydown', (e) => {
        const modal = document.getElementById('project-modal');
        if (modal && !modal.classList.contains('hidden')) {
            if (e.key === "ArrowLeft") navigateProject(-1);
            if (e.key === "ArrowRight") navigateProject(1);
            if (e.key === "Escape") closeModal();
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

        setupSocialLinks();
    } catch (e) { console.error(`Error loading ${path}:`, e); }
}

/* --- GITHUB API --- */
function updateServerStatus(state) {
    const ping = document.getElementById('status-ping');
    const dot = document.getElementById('status-dot');
    const text = document.getElementById('status-text');

    if (!ping || !dot || !text) return;

    // Réinitialisation des classes de couleur
    const colors = ['bg-green-400', 'bg-green-500', 'bg-orange-400', 'bg-orange-500', 'bg-red-400', 'bg-red-500'];
    ping.classList.remove(...colors);
    dot.classList.remove(...colors);

    if (state === 'online') {
        ping.classList.add('bg-green-400');
        dot.classList.add('bg-green-500');
        text.innerText = "Server Status: Online";
        text.classList.replace('text-orange-400', 'text-gray-300');
        text.classList.replace('text-red-400', 'text-gray-300');
    } else if (state === 'limited') { // Pour la 403 (Quota)
        ping.classList.add('bg-orange-400');
        dot.classList.add('bg-orange-500');
        text.innerText = "Server Status: Rate Limited";
        text.classList.add('text-orange-400');
    } else if (state === 'offline') { // Pour les erreurs critiques
        ping.classList.add('bg-red-400');
        dot.classList.add('bg-red-500');
        text.innerText = "Server Status: Connection Error";
        text.classList.add('text-red-400');
    }
}

async function fetchGithubProjects() {
    const container = document.getElementById('github-projects-container');
    const featuredContainer = document.getElementById('featured-projects-container');
    if (!container) return;

    const username = 'OneShot666';
    const cacheKey = `cache_repos_list`;

    try {
        const res = await fetch(`https://api.github.com/users/${username}/repos?sort=updated`);

        if (res.status === 403) {
            updateServerStatus('limited'); // On passe en ORANGE
            throw new Error("Quota atteint"); // On force le passage dans le bloc "catch"
        }

        if (!res.ok) throw new Error("Erreur serveur");

        updateServerStatus('online'); // On passe en VERT

        const repos = await res.json();
        if (!Array.isArray(repos)) return;
        // Sauvegarder la liste brute en cache pour la prochaine fois
        localStorage.setItem(cacheKey, JSON.stringify({ data: repos, timestamp: Date.now() }));

        renderProjects(repos); // On appelle une fonction qui dessine les cartes

    } catch (e) {
        // Si c'est une erreur de connexion (pas de 403)
        if (!e.message.includes("Quota")) {
            updateServerStatus('offline'); // On passe en ROUGE
        }

        console.warn("GitHub API indisponible, tentative de chargement du cache...");
        const cached = localStorage.getItem(cacheKey);

        if (cached) {
            const { data } = JSON.parse(cached);
            renderProjects(data);
        } else {
            container.innerHTML = `<p class="text-gray-500 italic text-sm col-span-full text-center">
                Premier chargement impossible (Quota API atteint). Réessayez dans une heure.</p>`;
        }
    }

    applyProjectFilter();
}

function getProjectTech(repo) {
    const topics = repo.topics.map(t => t.toLowerCase());
    const language = (repo.language || "").toLowerCase();

    if (topics.includes('unity')) return { id: "unity", label: "Unity", tagClass: "tag-unity" };
    if (topics.includes('unreal')) return { id: "unreal", label: "Unreal Engine", tagClass: "tag-unreal" };
    if (topics.includes('python') || topics.includes('pygame') || language === 'python')
        return { id: "python", label: "Python", tagClass: "tag-python" };
    if (topics.includes('website') || language === 'javascript' || language === 'java' || language === 'php' || language === 'html')
        return { id: "web", label: "Web Dev", tagClass: "tag-general" };
    return { id: "other", label: "Informatique", tagClass: "tag-general" };
}

// On déporte la création du HTML ici pour plus de clarté
function renderProjects(repos) {
    const standardContainer = document.getElementById('github-projects-container');
    const featuredContainer = document.getElementById('featured-projects-container');

    const username = 'OneShot666';
    const forbidden = [username.toLowerCase(), 'ourofolios', 'portfolio'];

    const allRepos = repos                                                      // Filter and sort by stars
        .filter(repo => !repo.fork && !forbidden.some(k => repo.name.toLowerCase().includes(k)))
        .sort((a, b) => b.stargazers_count - a.stargazers_count);

    const featured = [];
    const usedIds = new Set();
    const categoriesFound = new Set();

    allRepos.forEach(repo => {                                                  // Get best projects
        const tech = getProjectTech(repo);
        // Si c'est une catégorie qu'on veut mettre en avant et qu'on ne l'a pas encore remplie
        if (tech.id !== 'other' && !categoriesFound.has(tech.id)) {
            featured.push(repo);
            usedIds.add(repo.id);
            categoriesFound.add(tech.id);
        }
    });

    featured.sort((a, b) => b.stargazers_count - a.stargazers_count);           // Re-sort list

    // 3. Rendu des Featured
    if (featuredContainer) {
        featuredContainer.innerHTML = renderRepos(featured);
    }

    const remaining = allRepos.filter(r => !usedIds.has(r.id));
    if (standardContainer) {
        standardContainer.innerHTML = renderRepos(remaining);
    }

    initProjectViewers();                                                       // Look for all projects image
}

function renderRepos(repos) {
    const username = 'OneShot666';

    return repos.map(repo => {
        const tech = getProjectTech(repo);                                      // Get infos (tag...)
        const starCount = repo.stargazers_count > 0 ?                           // Display stars
            `<span class="text-yellow-500 text-[10px] ml-2">★ ${repo.stargazers_count}</span>` : '';
        const r_name = repo.name.includes("-") ? titleCase(repo.name.replace(/-/g, ' ')) : repo.name;
        const hasImages = projectLibrary[repo.name] && projectLibrary[repo.name].images.length > 1;
        const multipleImagesClass = hasImages ? 'has-multiple-images' : '';

        return `
        <div class="project-card group cursor-pointer ${multipleImagesClass}" onclick="openProjectModal('${username}/${repo.name}')"
        data-repo="${username}/${repo.name}" data-title="${r_name}" data-stars="${repo.stargazers_count}" data-img-path="img/screenshots">
            <div class="project-media loading relative w-full overflow-hidden bg-black/50">
                <img src="assets/img/icon-bg.png" class="project-viewer w-full h-full object-cover transition-opacity duration-500" alt="Aperçu">

                <div class="viewer-controls hidden absolute inset-0 z-30">
                    <button onclick="changeImage(this, -1, event)" class="absolute left-2 top-1/2 -translate-y-1/2 bg-black/70 p-2 rounded-full hover:bg-blue-500 hover:scale-110 text-white transition-all">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
                    </button>
                    <button onclick="changeImage(this, 1, event)" class="absolute right-2 top-1/2 -translate-y-1/2 bg-black/70 p-2 rounded-full hover:bg-blue-500 hover:scale-110 text-white transition-all">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
                    </button>
                </div>

                <div class="img-counter hidden absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 rounded text-[10px] font-mono text-blue-400 border border-white/10 shadow-lg">
                    <span class="img-index">01</span>/<span class="img-total">01</span>
                </div>
            </div>

            <div class="project-body">
                <span class="tag ${tech.tagClass}">${tech.label}</span>
                <h3 class="project-title text-xl font-bold">${r_name} ${starCount}</h3>
                <p class="project-text text-sm text-gray-400 mt-2">${repo.description || "Exploration technique."}</p>
                <a href="${repo.html_url}" target="_blank"
                    class="inline-block mt-4 text-xs text-blue-400 hover:text-white font-bold tracking-widest uppercase">Voir le code →</a>
            </div>
        </div>`;
    }).join('');
}

async function updateProjectsDropdown() {
    const container = document.getElementById('dropdown-items-container');
    if (!container) return;

    const categories = [
        { id: 'all', label: 'Tous les Projets' },
        { id: 'unity', label: 'Systèmes Unity' },
        { id: 'unreal', label: 'Unreal Engine' },
        { id: 'python', label: 'Scripts Python' },
        { id: 'web', label: 'Développement Web' }
    ];

    const isSubPage = window.location.pathname.includes('pages/');
    const rootPath = isSubPage ? '../../index.html' : 'index.html';

    container.innerHTML = categories.map(cat => `
        <a href="${rootPath}?filter=${cat.id}" class="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all group/item">
            <div class="w-1 h-1 rounded-full bg-blue-500 group-hover/item:shadow-[0_0_8px_#3b82f6] transition-all"></div>
            <span class="text-sm text-gray-400 group-hover/item:text-white transition-colors">${cat.label}</span>
        </a>
    `).join('');
}

function applyProjectFilter() {
    const params = new URLSearchParams(window.location.search);
    const filter = params.get('filter'); // Récupère 'python', 'unreal', etc.
    const cards = document.querySelectorAll('.project-card');

    if (cards.length === 0) return;
    if (!filter || filter === 'all') {
        cards.forEach(card => { card.style.display = 'flex'; setTimeout(() => card.style.opacity = '1', 10); });
        return;
    }

    cards.forEach(card => {
        const tagElement = card.querySelector('.tag');
        if (!tagElement) return;

        const tagText = tagElement.innerText.toLowerCase();
        if (!filter || filter === 'all') {
            card.style.display = 'flex';
            card.style.opacity = '1';
            return;
        }

        if (tagText.includes(filter.toLowerCase())) {
            card.style.display = 'flex';
            setTimeout(() => card.style.opacity = '1', 10);
        } else {
            setTimeout(() => card.style.display = 'none', 500);
            card.style.opacity = '0';                                           // Hide if not found
        }
    });
}

// Stockage local des listes d'images pour chaque projet
const projectLibrary = {};
// Variable globale pour les intervalles d'auto-play
const autoPlayIntervals = {};

async function initProjectViewers() {
    const cards = document.querySelectorAll('.project-card');

    for (const [i, card] of cards.entries()) {
        const repo = card.dataset.repo;
        if (!repo) continue;

        // 1. Vérifier si on a déjà les données en cache
        const cachedData = localStorage.getItem(`cache_${repo}`);
        let imagesToUse = null;

        if (cachedData) {
            const { images, timestamp } = JSON.parse(cachedData);
            const isExpired = Date.now() - timestamp > 3600000; // Cache expire après 1h

            if (!isExpired) {
                applyImagesToCard(card, repo, images, i);
                continue; // On passe au projet suivant sans faire de fetch
            } else {
                // Le cache est expiré, mais on le garde au cas où le fetch échoue !
                imagesToUse = images;
            }
        }

        try {
            const path = card.dataset.imgPath || 'screenshots';
            const response = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`);

            if (response.ok) {
                const data = await response.json();
                const images = data
                    .filter(file => /\.(png|jpg|jpeg|gif|webp)$/i.test(file.name))
                    .map(file => {
                        // ON AJOUTE L'ANTI-COLLISION ICI
                        const separator = file.download_url.includes('?') ? '&' : '?';
                        return `${file.download_url}${separator}repo=${repo.replace('/', '_')}`;
                    });

                if (images.length > 0) {
                    // 2. Sauvegarder dans le localStorage
                    localStorage.setItem(`cache_${repo}`, JSON.stringify({
                        images,
                        timestamp: Date.now()
                    }));

                    applyImagesToCard(card, repo, images, i);
                } else {
                    card.querySelector('.project-media').classList.remove('loading');
                }
            } else if (imagesToUse) {
                // SI ERREUR (403 par exemple), mais qu'on a un vieux cache : on l'utilise !
                console.log(`Fallback cache pour ${repo}`); // !!!
                applyImagesToCard(card, repo, imagesToUse, i);
            }
        } catch (e) {
//            card.querySelector('.project-media').classList.remove('loading');
            if (imagesToUse) applyImagesToCard(card, repo, imagesToUse, i);
        }
    }
}

// Petite fonction pour éviter de répéter le code
function applyImagesToCard(card, repo, images, index) {
    card.querySelector('.project-media').classList.remove('loading');
    projectLibrary[repo] = { images, current: 0 };
    images.forEach(url => preloadImage(url));

    if (images.length > 1) {
        card.classList.add('has-multiple-images');
        updateCardDisplay(card, repo);
        // 3. Lancement de l'Auto-play (toutes les 2 secondes pour laisser le temps de voir)
        startAutoPlay(card, repo, index);
        // Arrêter l'auto-play si la souris survole pour laisser le contrôle manuel
        card.addEventListener('mouseenter', () => stopAutoPlay(repo));
        card.addEventListener('mouseleave', () => startAutoPlay(card, repo, index));
    } else {
        card.querySelector('.project-viewer').src = images[0];
    }
}

function startAutoPlay(card, repo, index) {
    if (autoPlayIntervals[repo]) return;

    // Calcul du décalage initial : 0.5s * index de la carte
    const staggerDelay = index * 500;

    // On attend le décalage, puis on lance l'intervalle régulier
    setTimeout(() => {
        autoPlayIntervals[repo] = setInterval(() => {
            const lib = projectLibrary[repo];
            lib.current = (lib.current + 1) % lib.images.length;
            updateCardDisplay(card, repo);
        }, USER_CONFIG.animationSettings.cardDelay); // Intervalle de 4s

        // Optionnel : Forcer un premier changement immédiat après le stagger
        const lib = projectLibrary[repo];
        lib.current = (lib.current + 1) % lib.images.length;
        updateCardDisplay(card, repo);

    }, staggerDelay);
}

function stopAutoPlay(repo) {
    clearInterval(autoPlayIntervals[repo]);
    delete autoPlayIntervals[repo];
}

function updateCardDisplay(card, repo) {
    const lib = projectLibrary[repo];
    const imgElement = card.querySelector('.project-viewer');
    const indexElement = card.querySelector('.img-index');
    const totalElement = card.querySelector('.img-total');

    imgElement.style.opacity = '0';

    // ÉTAPE 2 : Attendre la fin du fondu (0.8s défini dans le CSS)
    setTimeout(() => {
        // Changer la source pendant que c'est invisible
        imgElement.src = lib.images[lib.current];

        // Mettre à jour les compteurs
        if(indexElement) indexElement.innerText = (lib.current + 1).toString().padStart(2, '0');
        if(totalElement) totalElement.innerText = lib.images.length.toString().padStart(2, '0');

        // ÉTAPE 3 : Une fois l'image chargée, relancer le fondu entrant (Fade-in)
        imgElement.onload = () => {
            imgElement.style.opacity = '1';
        };

        // Sécurité si l'image est déjà en cache et que onload ne déclenche pas
        if (imgElement.complete) {
            imgElement.style.opacity = '1';
        }
    }, USER_CONFIG.animationSettings.transitionDelay);
}

window.changeImage = function(button, direction, event) {
    if (event) event.stopPropagation();                                         // Prevent clicking on link behind arrows

    const card = button.closest('.project-card');
    const repo = card.dataset.repo;
    const lib = projectLibrary[repo];

    if (!lib|| lib.images.length <= 1) return;

    lib.current = (lib.current + direction + lib.images.length) % lib.images.length;    // Loop between images
    updateCardDisplay(card, repo);
};

/* --- DETAIL CARD MODAL --- */
async function openProjectModal(repoName) {
    currentOpenRepo = repoName; // On stocke le nom du repo ouvert
    stopModalAutoPlay(); // Sécurité : on arrête l'ancien défilement s'il y en avait un

    // --- RÉINITIALISATION (Nettoyage de l'ancien contenu) ---
    const readmeContainer = document.getElementById('modal-readme');
    const readmeWrapper = document.getElementById('modal-readme-container');
    if (readmeContainer) readmeContainer.innerHTML = ''; // On vide le texte
    if (readmeWrapper) readmeWrapper.classList.add('hidden'); // On cache le bloc README par défaut

    // 1. Récupération des éléments du bouton
    const playBtn = document.getElementById('modal-play-btn');
    if (playBtn) {
        playBtn.innerHTML = "<span>Analyse du dépôt...</span>";
        playBtn.classList.add('opacity-50', 'pointer-events-none');
        playBtn.href = "#";
        playBtn.onclick = null;                                                 // Disable click during analysis
    }

    try {
        // 2. On lance deux requêtes en parallèle pour gagner du temps
        const [repoRes, releaseRes] = await Promise.all([
            fetch(`https://api.github.com/repos/${repoName}`),
            fetch(`https://api.github.com/repos/${repoName}/releases/latest`)
        ]);

        const repoData = await repoRes.json();
        let releaseData = null;
        if (releaseRes.ok) releaseData = await releaseRes.json();

        // 3. Mise à jour intelligente du bouton
        await updatePlayButton(repoData, releaseData);

    } catch (e) {
        console.error("Erreur lors de la mise à jour du bouton :", e);
        if (playBtn) playBtn.classList.add('hidden'); // On cache si erreur
    }

    const lib = projectLibrary[repoName] || { images: ['assets/img/icon-bg.png'] };
    const card = document.querySelector(`[data-repo="${repoName}"]`);
    if (!card) return;

    const modal = document.getElementById('project-modal');

    // Initialisation de l'index interne pour la modal
    lib.currentModalIndex = 0;

    // Remplissage des textes (Titre, Desc, etc.)
    document.getElementById('modal-title').innerText = card.dataset.title;
    document.getElementById('modal-description').innerText = card.querySelector('.project-text').innerText;
    document.getElementById('modal-link').href = card.querySelector('a').href;

    const tagContainer = document.getElementById('modal-tag');
    tagContainer.innerHTML = '';
    tagContainer.appendChild(card.querySelector('.tag').cloneNode(true));

    // Gestion des étoiles
    const stars = parseInt(card.dataset.stars || 0);
    const starsContainer = document.getElementById('modal-stars-container');
    if (stars > 0) {
        document.getElementById('modal-stars').innerText = stars;
        starsContainer.classList.remove('hidden');
    } else {
        starsContainer.classList.add('hidden');
    }

    // Galerie d'images
    const mainImg = document.getElementById('modal-main-img');
    const thumbContainer = document.getElementById('modal-thumbnails');
    mainImg.src = lib.images[0];
    thumbContainer.innerHTML = '';

    if (lib.images.length > 1) {
        lib.images.forEach((imgUrl, idx) => {
            const thumb = document.createElement('img');
            thumb.src = imgUrl;
            thumb.className = `w-16 h-12 object-cover rounded-md cursor-pointer border-2 border-transparent hover:border-blue-500 transition-all ${idx === 0 ? 'border-blue-500 opacity-100' : 'opacity-50 hover:opacity-100'}`;

            thumb.onclick = () => {
                stopModalAutoPlay(); // On arrête l'auto-play si l'utilisateur clique
                changeModalImage(repoName, idx);
            };
            thumbContainer.appendChild(thumb);
        });

        // LANCEMENT DE L'AUTO-PLAY DE LA MODAL
        startModalAutoPlay(repoName);
    }

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // ... (Reste de ton code pour le README avec le cache)
    loadModalReadme(repoName); // J'ai factorisé pour la clarté
}

async function updatePlayButton(repo, release) {
    const playBtn = document.getElementById('modal-play-btn');
    if (!playBtn) return;

    playBtn.classList.remove('opacity-50', 'pointer-events-none', 'hidden');
    playBtn.onclick = null; // On nettoie l'ancien événement click
    playBtn.target = "_blank";

    const config = USER_CONFIG.projectSettings ? USER_CONFIG.projectSettings[repo.name] : null;
    const ghPagesUrl = await checkGithubPages(repo.name);                       // Check if dynamic url already exists

    if ((config && config.type === "iframe") ||ghPagesUrl) {                    // 1- If iframe url exists
        const finalUrl = (config && config.type === "iframe") ? config.url : ghPagesUrl;

        playBtn.innerHTML = `<span>🎮 Lancer le système</span>`;
        playBtn.href = "javascript:void(0)";                                    // Prevent y-scroll
        playBtn.target = "_self";
        playBtn.className = "btn-play-web";

        playBtn.onclick = (e) => { e.preventDefault(); openGameModal(finalUrl, repo.name); };   // Attach opening modal function
        return;                                                                 // Found playable url: stop function
    } else if (repo.homepage && repo.homepage.trim() !== "") {                  // 2- If github link exists
        playBtn.innerHTML = `<span>🌐 Jouer en ligne</span>`;
        playBtn.href = repo.homepage;
        playBtn.target = "_blank";
        playBtn.className = "btn-play-web";
        return;
    } else if (release && release.assets && release.assets.length > 0) {        // 3- If downloadable link exists
        const asset = release.assets.find(a => a.name.endsWith('.zip') || a.name.endsWith('.exe'));
        if (asset) {
            playBtn.innerHTML = `<span>💾 Télécharger (.zip)</span>`;
            playBtn.href = asset.browser_download_url;
            playBtn.className = "btn-play-download";
        } else {                                                                // No compatible asset found
            playBtn.classList.add('hidden');
        }
    } else {                                                                    // If nothing found, hide play button again
        playBtn.classList.add('hidden');
    }
}

function startModalAutoPlay(repoName) {
    stopModalAutoPlay();
    const lib = projectLibrary[repoName];

    modalAutoPlayInterval = setInterval(() => {
        lib.currentModalIndex = (lib.currentModalIndex + 1) % lib.images.length;
        changeModalImage(repoName, lib.currentModalIndex);
    }, USER_CONFIG.animationSettings.modalDelay); // On reste 6 secondes sur chaque image (plus relax)
}

function changeModalImage(repoName, index) {
    const lib = projectLibrary[repoName];
    const mainImg = document.getElementById('modal-main-img');
    const thumbs = document.querySelectorAll('#modal-thumbnails img');

    if (!mainImg) return;

    // 1. Fondu sortant total
    mainImg.style.opacity = '0';

    // 2. On attend que l'image disparaisse (cohérent avec la transition CSS)
    setTimeout(() => {
        mainImg.src = lib.images[index];

        // Mise à jour visuelle des miniatures
        thumbs.forEach((t, i) => {
            if (i === index) {
                t.classList.add('border-blue-500', 'opacity-100');
                t.classList.remove('opacity-50');
            } else {
                t.classList.remove('border-blue-500', 'opacity-100');
                t.classList.add('opacity-50');
            }
        });

        // 3. Une fois que la nouvelle image commence à charger, on la réaffiche
        mainImg.onload = () => {
            mainImg.style.opacity = '1';
        };

        // Sécurité si déjà en cache
        if (mainImg.complete) {
            mainImg.style.opacity = '1';
        }
    }, 500); // Temps du fondu sortant
}

function stopModalAutoPlay() {
    if (modalAutoPlayInterval) {
        clearInterval(modalAutoPlayInterval);
        modalAutoPlayInterval = null;
    }
}

async function loadModalReadme(repoName) {
    const readmeContainer = document.getElementById('modal-readme');
    const readmeWrapper = document.getElementById('modal-readme-container');
    const cacheKey = `readme_${repoName}`;

    // 1. Check Cache
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
        const { html, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < 86400000) { // 24h
            readmeContainer.innerHTML = html;
            readmeWrapper.classList.remove('hidden');
            return;
        }
    }

    // 2. Fetch GitHub
    try {
        const res = await fetch(`https://api.github.com/repos/${repoName}/readme`, {
            headers: { 'Accept': 'application/vnd.github.html' }
        });

        if (res.ok) {
            const htmlText = await res.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlText, 'text/html');
            doc.querySelectorAll('img').forEach(img => img.remove());           // Remove images (bagdes, logos...)
            doc.querySelectorAll('.anchor').forEach(anchor => anchor.remove()); // Remove link icons
            const finalHtml = doc.body.innerHTML || htmlText;                   // In case of a problem
            readmeContainer.innerHTML = finalHtml;

            localStorage.setItem(cacheKey, JSON.stringify({ html: finalHtml, timestamp: Date.now() }));  // Save cache
            readmeWrapper.classList.remove('hidden');
        } else {
            readmeWrapper.classList.add('hidden');                              // Hide if error
        }
    } catch (e) {
        readmeWrapper.classList.add('hidden');
    }
}

function closeModal() {
    stopModalAutoPlay(); // ON ARRÊTE TOUT
    document.getElementById('project-modal').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

function navigateProject(direction) {
    // 1. On cible UNIQUEMENT les cartes dans le conteneur de projets
    const container = document.getElementById('github-projects-container');
    if (!container) return;

    const allCards = Array.from(container.querySelectorAll('.project-card'))
        .filter(card => { return window.getComputedStyle(card).display !== 'none'; });

    if (allCards.length <= 1) return;

    // 2. Trouver l'index du projet actuellement ouvert
    const currentIndex = allCards.findIndex(card => card.dataset.repo === currentOpenRepo);

    // Si pour une raison X on ne trouve pas l'index, on repart de 0
    if (currentIndex === -1) {
        openProjectModal(allCards[0].dataset.repo);
        return;
    }

    // 3. Calculer le nouvel index (Boucle infinie)
    let nextIndex = (currentIndex + direction + allCards.length) % allCards.length;

    console.log(`Navigation : ${currentIndex + 1} -> ${nextIndex + 1} sur ${allCards.length} projets visibles`);    // !!!

    const nextRepo = allCards[nextIndex].dataset.repo;

    // 4. Ouvrir le nouveau projet
    if (nextRepo) openProjectModal(nextRepo);
}

function setupSocialLinks() {
    document.querySelectorAll('[data-link]').forEach(el => {
        const platform = el.getAttribute('data-link');
        if (USER_CONFIG.links[platform]) {
            el.href = USER_CONFIG.links[platform];
            el.target = "_blank";                                               // Open in new tab
        }
    });
}

// Rendre la fonction accessible globalement pour les onclick
window.openProjectModal = openProjectModal;
window.closeModal = closeModal;

/* -- Game modals -- */
function openGameModal(url, title, isPlayable = true) {
    const modal = document.getElementById('game-modal');
    const iframe = document.getElementById('game-viewport');
    const titleEl = document.getElementById('modal-game-title');
    const noPlayable = document.getElementById('no-playable-msg');

    titleEl.textContent = `SYSTEM_LOAD: ${title}`;
    modal.classList.remove('hidden');

    // Empêcher le scroll du body quand on joue
    document.body.style.overflow = 'hidden';

    if (isPlayable && url !== "#") {
        iframe.classList.remove('hidden');
        noPlayable.classList.add('hidden');
        iframe.src = url;
    } else {
        iframe.classList.add('hidden');
        noPlayable.classList.remove('hidden');
        iframe.src = "";
    }
}

function closeGameModal() {
    const modal = document.getElementById('game-modal');
    const iframe = document.getElementById('game-viewport');

    modal.classList.add('hidden');
    iframe.src = ""; // Très important : coupe le son et décharge la mémoire
    document.body.style.overflow = 'auto';
}

/* -- Contact form -- */
function initContactForm() {
    const form = document.getElementById('contact-form');
    const charCount = document.getElementById('char-count');
    const messageArea = document.getElementById('message');
    const status = document.getElementById('form-status');
    const submitBtn = document.getElementById('submit-btn');

    if (!form) return;

    // 1. Compteur de caractères en temps réel
    messageArea.addEventListener('input', () => {
        const remaining = 500 - messageArea.value.length;
        charCount.textContent = remaining;
        charCount.style.color = remaining < 50 ? '#ef4444' : '#6b7280';
    });

    // 2. Nettoyage des données (Anti-XSS simple)
    const sanitize = (str) => {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    };

    // 3. Envoi du formulaire
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const data = {
            name: sanitize(formData.get('name')),
            email: formData.get('email'), // Le type="email" du HTML gère la validation format
            subject: sanitize(formData.get('subject')),
            message: sanitize(formData.get('message'))
        };

        submitBtn.disabled = true;
        status.textContent = "Chiffrement et envoi en cours...";
        status.className = "text-blue-400 animate-pulse";

        try {
            const response = await fetch('https://formspree.io/f/mreolqlz', {
                method: 'POST',
                body: JSON.stringify(data),
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
            });

            // const result = await response.json();                            // Formspree response

            if (response.ok) {
                status.textContent = "Transmission réussie. Message reçu.";
                status.className = "text-green-400 font-bold";
                form.reset();
                charCount.textContent = "500";
            } else {
                throw new Error();
            }
        } catch (error) {
            status.textContent = "Erreur de transmission. Réessayez plus tard.";
            status.className = "text-red-400 font-bold";
        } finally {
            submitBtn.disabled = false;
        }
    });
}

/* -- Arrow to go back to top of page -- */
function initBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
        const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (window.scrollY / scrollableHeight) * 100;
        if (scrollPercent >= 50) {                                              // Appear only at 80% of page height
            btn.classList.remove('opacity-0', 'invisible');
            btn.classList.add('opacity-100', 'visible');
        } else {
            btn.classList.remove('opacity-100', 'visible');
            btn.classList.add('opacity-0', 'invisible');
        }
    });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/* --- INITIALIZATION --- */
document.addEventListener('DOMContentLoaded', () => {
    loadComponent('header-placeholder', 'assets/templates/header.html');
    loadComponent('footer-placeholder', 'assets/templates/footer.html');

    initCursor();                                                               // Launch modules
    initBackToTop();
    new ParticleManager('neural-canvas');
    fetchGithubProjects();
    initContactForm();

    setTimeout(updateProjectsDropdown, 500);
});

window.addEventListener('popstate', applyProjectFilter);                        // Check url modifications (without reloading)
