"""
Azure AI Search service.

On first import (or when reset_index() is called), this module:
  1. Deletes the existing 'excelearn-index' (keyword-only schema)
  2. Recreates it with:
       - id          (Edm.String, key)
       - content     (Edm.String, searchable)
       - title       (Edm.String, filterable)
       - source      (Edm.String, filterable)
       - page        (Edm.Int32,  filterable)
       - content_vector (Collection(Edm.Single), 3072 dims, HNSW)

Vector embeddings are generated via Gemini gemini-embedding-001 (3072 dims).
"""

import os
import uuid
from dotenv import load_dotenv
from pathlib import Path

from azure.core.credentials import AzureKeyCredential
from azure.core.exceptions import ResourceNotFoundError
from azure.search.documents import SearchClient
from azure.search.documents.indexes import SearchIndexClient
from azure.search.documents.indexes.models import (
    HnswAlgorithmConfiguration,
    SearchField,
    SearchFieldDataType,
    SearchIndex,
    SearchableField,
    SimpleField,
    VectorSearch,
    VectorSearchProfile,
)
from azure.search.documents.models import VectorizedQuery

from services.gemini import embed_text, embed_query

# ── Load env ──────────────────────────────────────────────────────────────────
load_dotenv(Path(__file__).parent.parent / ".env")

SEARCH_ENDPOINT = os.getenv("AZURE_SEARCH_ENDPOINT")
SEARCH_KEY      = os.getenv("AZURE_SEARCH_KEY")
INDEX_NAME      = os.getenv("AZURE_SEARCH_INDEX_NAME", "excelearn-index")

if not SEARCH_ENDPOINT or not SEARCH_KEY:
    raise EnvironmentError("AZURE_SEARCH_ENDPOINT or AZURE_SEARCH_KEY is not set in .env")

_credential   = AzureKeyCredential(SEARCH_KEY)
_index_client = SearchIndexClient(SEARCH_ENDPOINT, _credential)
_search_client = SearchClient(SEARCH_ENDPOINT, INDEX_NAME, _credential)

# ── Index schema ──────────────────────────────────────────────────────────────
VECTOR_DIMENSIONS   = 3072
VECTOR_FIELD        = "content_vector"
HNSW_CONFIG_NAME    = "excelearn-hnsw"
VECTOR_PROFILE_NAME = "excelearn-vector-profile"


def _build_index() -> SearchIndex:
    """Define the full vector-enabled index schema."""
    fields = [
        SimpleField(
            name="id",
            type=SearchFieldDataType.String,
            key=True,
            filterable=True,
        ),
        SearchableField(
            name="content",
            type=SearchFieldDataType.String,
        ),
        SimpleField(
            name="title",
            type=SearchFieldDataType.String,
            filterable=True,
            retrievable=True,
        ),
        SimpleField(
            name="source",
            type=SearchFieldDataType.String,
            filterable=True,
            retrievable=True,
        ),
        SimpleField(
            name="page",
            type=SearchFieldDataType.Int32,
            filterable=True,
            retrievable=True,
        ),
        SimpleField(
            name="user_id",
            type=SearchFieldDataType.String,
            filterable=True,
            retrievable=True,
        ),
        SearchField(
            name=VECTOR_FIELD,
            type=SearchFieldDataType.Collection(SearchFieldDataType.Single),
            searchable=True,
            vector_search_dimensions=VECTOR_DIMENSIONS,
            vector_search_profile_name=VECTOR_PROFILE_NAME,
        ),
    ]

    vector_search = VectorSearch(
        algorithms=[
            HnswAlgorithmConfiguration(
                name=HNSW_CONFIG_NAME,
            )
        ],
        profiles=[
            VectorSearchProfile(
                name=VECTOR_PROFILE_NAME,
                algorithm_configuration_name=HNSW_CONFIG_NAME,
            )
        ],
    )

    return SearchIndex(
        name=INDEX_NAME,
        fields=fields,
        vector_search=vector_search,
    )


def reset_index() -> dict:
    """
    Delete the existing index (if present) and recreate it with the
    vector-enabled schema. Returns a status dict.
    """
    # Step 1 — delete existing index
    try:
        _index_client.delete_index(INDEX_NAME)
        print(f"[azure_search] Deleted existing index: {INDEX_NAME}")
        deleted = True
    except ResourceNotFoundError:
        print(f"[azure_search] Index did not exist, creating fresh: {INDEX_NAME}")
        deleted = False
    except Exception as e:
        return {"success": False, "error": f"Delete failed: {str(e)}"}

    # Step 2 — create new index
    try:
        _index_client.create_index(_build_index())
        print(f"[azure_search] Created vector index: {INDEX_NAME}")
        return {
            "success": True,
            "deleted_old": deleted,
            "index": INDEX_NAME,
            "vector_dimensions": VECTOR_DIMENSIONS,
            "vector_field": VECTOR_FIELD,
            "algorithm": "HNSW (cosine)",
        }
    except Exception as e:
        return {"success": False, "error": f"Create failed: {str(e)}"}


def ensure_index() -> None:
    """
    Ensure the index exists with the correct vector schema.
    If it already exists, do nothing. If missing, create it fresh.
    (Does NOT delete an existing index — use reset_index() for that.)
    """
    existing = [idx.name for idx in _index_client.list_indexes()]
    if INDEX_NAME not in existing:
        _index_client.create_index(_build_index())
        print(f"[azure_search] Created index: {INDEX_NAME}")
    else:
        print(f"[azure_search] Index already exists: {INDEX_NAME}")


def upload_chunks(chunks: list[dict], user_id: str = None) -> int:
    """
    Embed and upload a list of text chunks to the index.

    Each chunk dict must have:
      - text    (str)  : the raw text content
      - title   (str)  : PDF filename / document title
      - source  (str)  : original filename
      - page    (int)  : page number

    Optional:
      - user_id (str)  : Firebase UID of the uploading user

    Returns the number of documents successfully indexed.
    """
    documents = []
    for chunk in chunks:
        embedding = embed_text(chunk["text"], task_type="retrieval_document")
        documents.append({
            "id":         str(uuid.uuid4()),
            "content":    chunk["text"],
            "title":      chunk.get("title", chunk.get("source", "unknown")),
            "source":     chunk.get("source", "unknown"),
            "page":       chunk.get("page", 0),
            "user_id":    chunk.get("user_id") or user_id or "",
            VECTOR_FIELD: embedding,
        })

    # Azure Search accepts up to 1000 docs per batch
    total_uploaded = 0
    for i in range(0, len(documents), 100):
        batch = documents[i : i + 100]
        _search_client.upload_documents(documents=batch)
        total_uploaded += len(batch)

    return total_uploaded


def delete_chunks_by_source(source: str) -> int:
    """
    Delete all indexed chunks whose 'source' field matches the given filename.
    Returns the number of documents deleted.
    """
    try:
        # Search for all docs with this source (keyword filter)
        results = _search_client.search(
            search_text="*",
            filter=f"source eq '{source}'",
            select=["id"],
            top=1000,
        )
        ids = [{"id": r["id"]} for r in results]
        if not ids:
            print(f"[azure_search] No chunks found for source: {source}")
            return 0
        # Delete in batches of 100
        deleted = 0
        for i in range(0, len(ids), 100):
            batch = ids[i : i + 100]
            _search_client.delete_documents(documents=batch)
            deleted += len(batch)
        print(f"[azure_search] Deleted {deleted} chunks for source: {source}")
        return deleted
    except Exception as e:
        print(f"[azure_search] delete_chunks_by_source failed: {e}")
        return 0


def hybrid_search(query: str, top: int = 3, user_id: str = None) -> list[dict]:
    """
    Hybrid search: vector similarity + keyword BM25.
    Falls back to keyword-only if vector search fails.

    When user_id is provided, results are filtered to only that user's documents.

    Returns list of { content, title, source, page }.
    """
    # Build OData filter for user isolation
    user_filter = f"user_id eq '{user_id}'" if user_id else None

    # Try vector + keyword hybrid first
    try:
        query_vector = embed_query(query)
        vector_query = VectorizedQuery(
            vector=query_vector,
            k_nearest_neighbors=top,
            fields=VECTOR_FIELD,
        )
        results = _search_client.search(
            search_text=query,
            vector_queries=[vector_query],
            filter=user_filter,
            select=["content", "title", "source", "page"],
            top=top,
        )
        chunks = [
            {
                "content": r.get("content", ""),
                "title":   r.get("title", "unknown"),
                "source":  r.get("source", "unknown"),
                "page":    r.get("page", 0),
            }
            for r in results
        ]
        if chunks:
            return chunks
    except Exception as e:
        print(f"[azure_search] Vector search failed, falling back to keyword: {e}")

    # Fallback: keyword-only
    try:
        results = _search_client.search(
            search_text=query,
            filter=user_filter,
            select=["content", "title", "source", "page"],
            top=top,
        )
        return [
            {
                "content": r.get("content", ""),
                "title":   r.get("title", "unknown"),
                "source":  r.get("source", "unknown"),
                "page":    r.get("page", 0),
            }
            for r in results
        ]
    except Exception as e:
        print(f"[azure_search] Keyword search also failed: {e}")
        return []
