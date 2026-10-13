-- Apply only when an embedding provider is configured. Not run by db:migrate.
CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE IF NOT EXISTS entity_embeddings (
  entity_id uuid PRIMARY KEY,
  owner_id uuid NOT NULL,
  model text NOT NULL,
  embedding vector(1536) NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY(owner_id,entity_id) REFERENCES entities(owner_id,id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS embeddings_cosine ON entity_embeddings USING hnsw (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS embeddings_owner ON entity_embeddings(owner_id);
