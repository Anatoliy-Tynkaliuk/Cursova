-- Rename youngest age group code from 3_5 to 4_5 and align displayed bounds/title
UPDATE "age_groups"
SET
  "code" = '4_5',
  "title" = '4–5 років',
  "minAge" = 4,
  "maxAge" = 5
WHERE "code" = '3_5';
