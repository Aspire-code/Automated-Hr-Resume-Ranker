const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const { sql, poolPromise } = require('../config/db');

router.post('/rank-resume', async (req, res) => {
  const { candidate_name, candidate_email, phone, job_id, file_name, resume_text, job_description } = req.body;

  try {
    const pool = await poolPromise;

    // Step 1: Insert Candidate into Database
    const candidateResult = await pool.request()
      .input('name', sql.VarChar, candidate_name)
      .input('email', sql.VarChar, candidate_email)
      .input('phone', sql.VarChar, phone)
      .query(`
        INSERT INTO Candidates (name, email, phone) 
        OUTPUT INSERTED.candidate_id 
        VALUES (@name, @email, @phone);
      `);
    const candidate_id = candidateResult.recordset[0].candidate_id;

    // Step 2: Call Python script for AI Evaluation
    const pythonProcess = spawn('python', [
      './services/evaluate_resume.py', 
      job_description, 
      resume_text
    ]);

    let pythonData = '';
    pythonProcess.stdout.on('data', (data) => {
      pythonData += data.toString();
    });

    pythonProcess.on('close', async (code) => {
      if (code !== 0) {
        return res.status(500).json({ error: 'AI Evaluation script failed' });
      }

      try {
        // Clean up markdown code blocks if Gemini outputs them in JSON
        const cleanJson = pythonData.replace(/```json/g, '').replace(/```/g, '').trim();
        const evaluation = JSON.parse(cleanJson);

        // Step 3: Insert into Resumes table
        const resumeResult = await pool.request()
          .input('candidate_id', sql.Int, candidate_id)
          .input('job_id', sql.Int, job_id)
          .input('file_name', sql.VarChar, file_name)
          .input('skills', sql.Text, resume_text.substring(0, 500)) // truncated example
          .query(`
            INSERT INTO Resumes (candidate_id, job_id, file_name, skills) 
            OUTPUT INSERTED.resume_id 
            VALUES (@candidate_id, @job_id, @file_name, @skills);
          `);
        const resume_id = resumeResult.recordset.candidateresume_id || resumeResult.recordset[0].resume_id;

        // Step 4: Insert into RankingResults table
        await pool.request()
          .input('resume_id', sql.Int, resume_id)
          .input('score', sql.Decimal(5,2), evaluation.score)
          .input('rank', sql.Int, evaluation.rank)
          .input('remarks', sql.Text, evaluation.remarks)
          .query(`
            INSERT INTO RankingResults (resume_id, score, rank, remarks) 
            VALUES (@resume_id, @score, @rank, @remarks);
          `);

        res.status(201).json({
          message: 'Resume evaluated and ranked successfully!',
          evaluation
        });

      } catch (parseError) {
        console.error('JSON Parse Error:', parseError, pythonData);
        res.status(500).json({ error: 'Failed to parse AI evaluation response' });
      }
    });

  } catch (error) {
    console.error('Database or Processing Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;