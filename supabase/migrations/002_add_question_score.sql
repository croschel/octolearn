-- Add score column to quiz_questions to support partial credit on descriptive answers
ALTER TABLE quiz_questions
  ADD COLUMN score FLOAT DEFAULT NULL;
