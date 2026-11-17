INSERT INTO "Category" ("name", "slug", "updatedAt")
VALUES
  ('Desenvolvimento Frontend', 'frontend', CURRENT_TIMESTAMP),
  ('Desenvolvimento Backend', 'backend', CURRENT_TIMESTAMP),
  ('Banco de Dados', 'banco-de-dados', CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO NOTHING;
