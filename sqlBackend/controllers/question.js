
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
        const [results, metadata] = await sequelize.query("SELECT * FROM sql_questions");
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
    // Get the questions array from the request body
    const questions = req.body;

    // Validate the questions array
    if (!Array.isArray(questions) || questions.length === 0) {
        return res.status(400).json({ error: 'Questions array is required' });
    }

    // Array to store the results of each insertion
    const results = [];

    try {
        // Iterate over each question in the array
        for (const question of questions) {
            const { question: questionId, sample_output, output } = question;

            // Validate each question object
            if (questionId == null || sample_output == null || output == null) {
                return res.status(400).json({ error: 'Each question must have an id, sample_output, and output' });
            }

            // Perform database insertion
            const [result] = await sequelize.query(
                "INSERT INTO sql_questions (question, sample_output, output, status) VALUES (?, ?, ?, '1')",
                {
                    replacements: [questionId, sample_output, output],
                    type: sequelize.QueryTypes.INSERT
                }
            );

            // Add the result of this insertion to the results array
            results.push({ id: result[0], question: questionId, sample_output, output });
        }

        // Return the results
        res.status(201).json(results);
    } catch (err) {
        // Handle any errors during the insertion
        res.status(500).json({ error: err.message });
    }
};