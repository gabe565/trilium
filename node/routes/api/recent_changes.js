const express = require('express');
const router = express.Router();
const sql = require('../../sql');
const auth = require('../../auth');

router.get('/', auth.checkApiAuth, async (req, res, next) => {
    const recentChanges = await sql.getResults("select * from notes_history order by date_modified desc limit 1000");

    res.send(recentChanges);
});

module.exports = router;