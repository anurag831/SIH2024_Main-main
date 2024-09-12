const router = require('express').Router();

router.get('/', (req, res, next)=>{
    res.render('../views/index');
});

module.exports = router;