"""
Azure Blob Storage service.
Handles uploading raw PDF files to the 'excelearn-pdfs' container.
"""

import os
from dotenv import load_dotenv
from pathlib import Path

from azure.storage.blob import BlobServiceClient

load_dotenv(Path(__file__).parent.parent / ".env")

BLOB_CONN_STR = os.getenv("AZURE_BLOB_CONNECTION_STRING")
CONTAINER     = "excelearn-pdfs"

if not BLOB_CONN_STR:
    raise EnvironmentError("AZURE_BLOB_CONNECTION_STRING is not set in .env")

_blob_service = BlobServiceClient.from_connection_string(BLOB_CONN_STR)


def _ensure_container() -> None:
    """Create the blob container if it doesn't already exist."""
    try:
        _blob_service.create_container(CONTAINER)
        print(f"[blob_storage] Created container: {CONTAINER}")
    except Exception:
        pass  # already exists


def upload_pdf(filename: str, data: bytes, subject: str = "General", user_id: str = None) -> str:
    """
    Upload a PDF to Azure Blob Storage.

    When user_id is provided, stores under: {user_id}/{subject}/{filename}
    Otherwise falls back to:               {subject}/{filename}

    Returns the full blob path.
    """
    _ensure_container()
    if user_id:
        blob_name = f"{user_id}/{subject}/{filename}"
    else:
        blob_name = f"{subject}/{filename}"
    container_client = _blob_service.get_container_client(CONTAINER)
    container_client.upload_blob(blob_name, data, overwrite=True)
    print(f"[blob_storage] Uploaded: {blob_name}")
    return blob_name


def delete_pdf(blob_path: str) -> None:
    """Delete a PDF blob by its full blob path (e.g. 'SC1007/filename.pdf')."""
    container_client = _blob_service.get_container_client(CONTAINER)
    container_client.delete_blob(blob_path)
    print(f"[blob_storage] Deleted: {blob_path}")


def list_pdfs(subject: str = None, user_id: str = None) -> list[str]:
    """
    List uploaded PDFs, optionally filtered by user_id and/or subject.

    With user_id:    lists blobs under {user_id}/{subject?}/
    Without user_id: lists blobs under {subject?}/ (legacy behaviour)
    """
    _ensure_container()
    container_client = _blob_service.get_container_client(CONTAINER)
    if user_id:
        prefix = f"{user_id}/{subject}/" if subject else f"{user_id}/"
    else:
        prefix = f"{subject}/" if subject else None
    try:
        blobs = container_client.list_blobs(name_starts_with=prefix)
        return [b.name for b in blobs]
    except Exception:
        return []
