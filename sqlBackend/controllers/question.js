
const { sequelize } = require('../models');

exports.getQuestions = async (req, res) => {
    try {
        const [results, metadata] = await sequelize.query("SELECT id,title, question FROM question WHERE status = '1'");
        res.status(200).json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAllQuestions = async (req, res) => {
    try {
        const [results, metadata] = await sequelize.query(`SELECT 
    sql_questions.id, 
    question.title, 
    question.question,
    sql_questions.question_name,
    sql_questions.sample_output, 
    sql_questions.output 
FROM 
    sql_questions
INNER JOIN 
    question 
ON 
    sql_questions.question = question.id
WHERE 
    question.status = '1'`);
        res.status(200).json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.createQuestion = async (req, res) => {
    const { title, question } = req.body;

    if (!question || !title) {
        return res.status(400).json({ error: 'Question and title are required' });
    }

    try {
        const [results, metadata] = await sequelize.query("INSERT INTO question (title, question, status) VALUES (?,?, '1')", {
            replacements: [title, question]
        });
        res.status(201).json({ id: results, title, question });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createAllQuestion = async (req, res) => {
    const questions = req.body;

    if (!Array.isArray(questions) || questions.length === 0) {
        return res.status(400).json({ error: 'Questions array is required' });
    }

    const results = [];

    try {
        for (const question of questions) {
            const { question: questionId, sample_output, output } = question;

            if (questionId == null || sample_output == null || output == null) {
                return res.status(400).json({ error: 'Each question must have an id, sample_output, and output' });
            }

            const [result] = await sequelize.query(
                "INSERT INTO sql_questions (question, sample_output, output, status) VALUES (?, ?, ?, '1')",
                {
                    replacements: [questionId, sample_output, output],
                    type: sequelize.QueryTypes.INSERT
                }
            );

            results.push({ id: result[0], question: questionId, sample_output, output });
        }

        res.status(201).json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};