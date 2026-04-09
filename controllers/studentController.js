const db         = require('../config/db');
const scanGitHub = require('../config/githubScanner');

exports.getDashboard = async (req, res) => {
    const user_id = req.session.user.user_id;
    try {
        const [profileRows] = await db.query('SELECT * FROM student_profiles WHERE user_id = $1', [user_id]);
        const profile = profileRows[0];

        // Parse stored JSON fields
        const languages   = profile.top_languages  ? JSON.parse(profile.top_languages)  : [];
        const suggestions = profile.ai_suggestions ? JSON.parse(profile.ai_suggestions) : [];

        const [applications] = await db.query(
            `SELECT a.*, t.title, t.required_skill, t.task_type, bp.company_name
             FROM applications a
             JOIN tasks t ON a.task_id = t.task_id
             JOIN business_profiles bp ON t.business_id = bp.profile_id
             WHERE a.student_id = $1
             ORDER BY a.applied_at DESC`,
            [profile.profile_id]
        );
        const [recommended] = await db.query(
            `SELECT t.*, bp.company_name
             FROM tasks t
             JOIN business_profiles bp ON t.business_id = bp.profile_id
             WHERE t.status = 'open' AND t.min_skill_score <= $1
             ORDER BY t.posted_at DESC LIMIT 5`,
            [profile.ai_skill_score]
        );

        res.render('student_dashboard', {
            user: req.session.user,
            profile, applications, recommended,
            languages, suggestions
        });
    } catch (err) { console.error(err); res.send('Error loading dashboard.'); }
};

exports.rescanGitHub = async (req, res) => {
    const user_id = req.session.user.user_id;
    try {
        const [profileRows] = await db.query(
            'SELECT profile_id, github_username FROM student_profiles WHERE user_id = $1', [user_id]
        );
        const profile = profileRows[0];
        if (!profile.github_username) return res.redirect('/student/dashboard');

        console.log(`Rescanning GitHub for: ${profile.github_username}...`);
        const result = await scanGitHub(profile.github_username);
        console.log(`Rescan complete. New score: ${result.score}`);

        await db.query(
            `UPDATE student_profiles
             SET ai_skill_score = $1, top_languages = $2, ai_suggestions = $3
             WHERE profile_id = $4`,
            [result.score, JSON.stringify(result.languages), JSON.stringify(result.suggestions), profile.profile_id]
        );
        res.redirect('/student/dashboard');
    } catch (err) { console.error(err); res.redirect('/student/dashboard'); }
};

exports.getApply = async (req, res) => {
    const { task_id } = req.params;
    try {
        const [rows] = await db.query(
            `SELECT t.*, bp.company_name, bp.industry
             FROM tasks t JOIN business_profiles bp ON t.business_id = bp.profile_id
             WHERE t.task_id = $1`, [task_id]
        );
        res.render('apply', { user: req.session.user, task: rows[0], error: null });
    } catch (err) { console.error(err); res.send('Task not found.'); }
};

exports.postApply = async (req, res) => {
    const { task_id, cover_note } = req.body;
    const user_id = req.session.user.user_id;
    try {
        const [pRows] = await db.query(
            'SELECT profile_id FROM student_profiles WHERE user_id = $1', [user_id]
        );
        await db.query(
            'INSERT INTO applications (task_id, student_id, cover_note) VALUES ($1, $2, $3)',
            [task_id, pRows[0].profile_id, cover_note]
        );
        res.redirect('/student/dashboard');
    } catch (err) {
        console.error(err);
        const [tRows] = await db.query('SELECT * FROM tasks WHERE task_id = $1', [task_id]);
        res.render('apply', { user: req.session.user, task: tRows[0], error: 'You have already applied to this task.' });
    }
};

exports.getSubmit = async (req, res) => {
    const { application_id } = req.params;
    try {
        const [rows] = await db.query(
            `SELECT a.*, t.title FROM applications a
             JOIN tasks t ON a.task_id = t.task_id WHERE a.application_id = $1`, [application_id]
        );
        res.render('submit', { user: req.session.user, application: rows[0], error: null });
    } catch (err) { console.error(err); res.send('Application not found.'); }
};

exports.postSubmit = async (req, res) => {
    const { application_id, submission_url, notes } = req.body;
    try {
        await db.query(
            'INSERT INTO submissions (application_id, submission_url, notes) VALUES ($1, $2, $3)',
            [application_id, submission_url, notes || null]
        );
        res.redirect('/student/dashboard');
    } catch (err) {
        console.error(err);
        res.render('submit', { user: req.session.user, application: { application_id }, error: 'Submission failed.' });
    }
};
