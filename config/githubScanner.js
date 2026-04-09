const https = require('https');

function fetchJSON(url) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.github.com',
            path: url,
            headers: { 'User-Agent': 'CampusLancer-App' }
        };
        https.get(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); }
                catch (e) { reject(e); }
            });
        }).on('error', reject);
    });
}

const LANGUAGE_WEIGHTS = {
    JavaScript: 10, TypeScript: 12, Python: 11, Java: 10,
    'C#': 10, 'C++': 11, C: 10, Go: 12, Rust: 13,
    PHP: 8, Ruby: 9, Swift: 11, Kotlin: 11,
    HTML: 3, CSS: 3, Shell: 5, SQL: 6,
};

// Job market demand for suggestions
const LANGUAGE_DEMAND = {
    JavaScript: { demand: 'Very High', jobs: 'Frontend, Full-stack, Node.js developer' },
    TypeScript:  { demand: 'Very High', jobs: 'Frontend, Full-stack, Angular/React developer' },
    Python:      { demand: 'Very High', jobs: 'Data Science, AI/ML, Backend developer' },
    Java:        { demand: 'High',      jobs: 'Backend, Android, Enterprise developer' },
    'C#':        { demand: 'High',      jobs: '.NET developer, Game developer, Backend' },
    'C++':       { demand: 'Medium',    jobs: 'Systems programmer, Game developer, Embedded' },
    Go:          { demand: 'High',      jobs: 'Backend, Cloud, DevOps engineer' },
    Rust:        { demand: 'Growing',   jobs: 'Systems programmer, WebAssembly, Blockchain' },
    PHP:         { demand: 'Medium',    jobs: 'Backend, WordPress, Web developer' },
    Ruby:        { demand: 'Medium',    jobs: 'Backend, Rails developer' },
    Swift:       { demand: 'High',      jobs: 'iOS developer, Apple platforms' },
    Kotlin:      { demand: 'High',      jobs: 'Android developer, Backend (Spring)' },
    SQL:         { demand: 'Very High', jobs: 'Database admin, Data analyst, Backend' },
    HTML:        { demand: 'High',      jobs: 'Frontend, Web developer' },
    CSS:         { demand: 'High',      jobs: 'Frontend, UI developer' },
};

// Skills to suggest learning based on what they already know
const SUGGESTIONS = {
    JavaScript: ['Learn TypeScript to make your JS code more robust', 'Learn React or Vue for frontend jobs', 'Learn Node.js for backend roles'],
    TypeScript:  ['Learn React or Angular — TypeScript is their preferred language', 'Learn NestJS for enterprise backend work'],
    Python:      ['Learn Django or FastAPI for backend web jobs', 'Learn Pandas and NumPy for data science roles', 'Learn TensorFlow or PyTorch for AI/ML jobs'],
    Java:        ['Learn Spring Boot — most Java backend jobs require it', 'Learn Kotlin — it runs on the same JVM and is growing fast'],
    'C#':        ['Learn ASP.NET Core for web backend roles', 'Learn Unity if you want game development'],
    PHP:         ['Learn Laravel — it is the most in-demand PHP framework', 'Consider adding JavaScript to become full-stack'],
    HTML:        ['Learn CSS if you have not — they always go together', 'Learn JavaScript to move from static to dynamic pages'],
    CSS:         ['Learn a CSS framework like Tailwind or Bootstrap', 'Learn JavaScript to add interactivity to your pages'],
    SQL:         ['Learn PostgreSQL or MySQL in depth', 'Learn a backend language like Python or Node.js to pair with SQL'],
    default:     ['Add a README to your repos — employers always check', 'Learn Git branching and pull requests', 'Build at least one full project from scratch and deploy it'],
};

async function scanGitHub(username) {
    try {
        const user = await fetchJSON(`/users/${username}`);
        if (user.message === 'Not Found') {
            return { score: 0, languages: [], suggestions: ['GitHub username not found. Please check and rescan.'] };
        }

        const repos = await fetchJSON(`/users/${username}/repos?per_page=100&sort=updated`);
        if (!Array.isArray(repos) || repos.length === 0) {
            return { score: 5, languages: [], suggestions: ['No public repos found. Start building projects and push them to GitHub.'] };
        }

        let score = 0;

        // ── Repo count (max 20) ──────────────────────────────
        score += Math.min(repos.length * 2, 20);

        // ── Language analysis ────────────────────────────────
        const langCount = {};
        repos.forEach(repo => {
            if (repo.language) {
                langCount[repo.language] = (langCount[repo.language] || 0) + 1;
            }
        });

        // Sort languages by usage count
        const sortedLangs = Object.entries(langCount)
            .sort((a, b) => b[1] - a[1])
            .map(([lang, count]) => ({
                name: lang,
                count,
                demand: LANGUAGE_DEMAND[lang]?.demand || 'Varies',
                jobs:   LANGUAGE_DEMAND[lang]?.jobs   || 'Various roles',
            }));

        // Language score (max 25)
        let langScore = 0;
        sortedLangs.forEach(l => {
            if (LANGUAGE_WEIGHTS[l.name]) langScore += LANGUAGE_WEIGHTS[l.name];
        });
        score += Math.min(langScore, 25);

        // ── Stars (max 15) ───────────────────────────────────
        const totalStars = repos.reduce((s, r) => s + r.stargazers_count, 0);
        score += Math.min(totalStars * 2, 15);

        // ── Descriptions / READMEs (max 15) ──────────────────
        const withDesc = repos.filter(r => r.description && r.description.length > 10).length;
        score += Math.min(withDesc * 2, 15);

        // ── Account age (max 10) ─────────────────────────────
        const yearsActive = new Date().getFullYear() - new Date(user.created_at).getFullYear();
        score += Math.min(yearsActive * 2, 10);

        // ── Followers (max 10) ───────────────────────────────
        score += Math.min(user.followers, 10);

        // ── Bio (5 points) ───────────────────────────────────
        if (user.bio && user.bio.length > 5) score += 5;

        // ── Build suggestions ────────────────────────────────
        const suggestionSet = new Set();
        const topLangs = sortedLangs.slice(0, 3).map(l => l.name);

        topLangs.forEach(lang => {
            const tips = SUGGESTIONS[lang] || [];
            tips.slice(0, 2).forEach(t => suggestionSet.add(t));
        });

        // Always add default tips if not enough suggestions
        if (suggestionSet.size < 3) {
            SUGGESTIONS.default.forEach(t => suggestionSet.add(t));
        }

        const finalScore = Math.min(Math.max(Math.round(score), 1), 100);

        return {
            score:       finalScore,
            languages:   sortedLangs.slice(0, 6),  // top 6 languages
            suggestions: [...suggestionSet].slice(0, 5), // top 5 suggestions
        };

    } catch (err) {
        console.error('GitHub scan error:', err.message);
        return { score: 0, languages: [], suggestions: ['GitHub scan failed. Please try again.'] };
    }
}

module.exports = scanGitHub;
