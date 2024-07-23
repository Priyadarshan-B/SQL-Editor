const express =require('express')
const router = express.Router();

const question = require('../controllers/question')

router.get('/questions', question.getQuestions);
router.get('/allquestion', question.getAllQuestions)

router.post('/questions', question.createQuestion);
router.post('/allquestion',question.createAllQuestion)

module.exports = router;