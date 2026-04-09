const db = require('../config/db');

exports.getDashboard = async (req, res) => {
    const user_id = req.session.user.user_id;
    try {
        const [pRows] = await db.query('SELECT * FROM business_profiles WHERE user_id = $1', [user_id]);
        const profile = pRows[0];
        const [tasks] = await db.query(
            `SELECT t.*, COUNT(a.application_id) AS total_applicants
             FROM tasks t LEFT JOIN applications a ON t.task_id = a.task_id
             WHERE t.business_id = $1
             GROUP BY t.task_id ORDER BY t.posted_at DESC`,
            [profile.profile_id]
        );
        const [topStudents] = await db.query(
            `SELECT sp.first_name, sp.last_name, sp.institution, sp.ai_skill_score,
                    sp.github_username, a.status, a.application_id, t.title AS task_title
             FROM applications a
             JOIN student_profiles sp ON a.student_id = sp.profile_id
             JOIN tasks t ON a.task_id = t.task_id
             WHERE t.business_id = $1
             ORDER BY sp.ai_skill_score DESC LIMIT 10`,
            [profile.profile_id]
        );
        res.render('business_dashboard', { user: req.session.user, profile, tasks, topStudents });
    } catch (err) { console.error(err); res.send('Error loading dashboard.'); }
};

exports.getPostTask = (req, res) => res.render('post_task', { user: req.session.user, error: null });

exports.postPostTask = async (req, res) => {
    const { title, description, required_skill, min_skill_score, task_type, deadline } = req.body;
    const user_id = req.session.user.user_id;
    try {
        const [pRows] = await db.query('SELECT profile_id FROM business_profiles WHERE user_id = $1', [user_id]);
        await db.query(
            `INSERT INTO tasks (business_id, title, description, required_skill, min_skill_score, task_type, deadline)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [pRows[0].profile_id, title, description, required_skill, min_skill_score || 0, task_type, deadline || null]
        );
        res.redirect('/business/dashboard');
    } catch (err) {
        console.error(err);
        res.render('post_task', { user: req.session.user, error: 'Could not post task. Try again.' });
    }
};

exports.getApplicants = async (req, res) => {
    const { task_id } = req.params;
    try {
        const [tRows] = await db.query('SELECT * FROM tasks WHERE task_id = $1', [task_id]);
        const [applicants] = await db.query(
            `SELECT a.application_id, a.cover_note, a.status, a.applied_at,
                    sp.first_name, sp.last_name, sp.institution, sp.ai_skill_score, sp.github_username
             FROM applications a
             JOIN student_profiles sp ON a.student_id = sp.profile_id
             WHERE a.task_id = $1
             ORDER BY sp.ai_skill_score DESC`,
            [task_id]
        );
        res.render('applicants', { user: req.session.user, task: tRows[0], applicants });
    } catch (err) { console.error(err); res.send('Could not load applicants.'); }
};

exports.updateApplicationStatus = async (req, res) => {
    const { application_id, status } = req.body;
    try {
        await db.query('UPDATE applications SET status = $1 WHERE application_id = $2', [status, application_id]);
        res.redirect('back');
    } catch (err) { console.error(err); res.send('Could not update status.'); }
};

exports.deleteTask = async (req, res) => {
    const { task_id } = req.params;
    try {
        await db.query('DELETE FROM tasks WHERE task_id = $1', [task_id]);
        res.redirect('/business/dashboard');
    } catch (err) { console.error(err); res.send('Could not delete task.'); }
};
