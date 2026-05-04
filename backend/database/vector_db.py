"""
Precedent Similarity Search — Local Contextual RAG

Uses ChromaDB for local vector storage and sentence-transformers
for embedding legal directives. Surfaces historically similar cases
to give the reviewer contextual decision support.
"""

import os
import json
from typing import List
from backend.core.schemas import PrecedentMatch
from backend.logger import get_logger
from backend.config import settings

logger = get_logger(__name__)

# Path for the ChromaDB persistent storage
CHROMA_PERSIST_DIR = str(settings.DB_PATH.parent / "chroma_db")

# Path for sample historical data
SAMPLE_DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "historical_precedents.json")

# Lazy-loaded globals
_collection = None
_embed_model = None


def _get_embed_model():
    """Lazy load the sentence-transformer model."""
    global _embed_model
    if _embed_model is None:
        from sentence_transformers import SentenceTransformer
        _embed_model = SentenceTransformer("all-MiniLM-L6-v2")
        logger.info("Sentence-transformer model loaded.")
    return _embed_model


def _get_collection():
    """Lazy load the ChromaDB collection."""
    global _collection
    if _collection is None:
        import chromadb
        client = chromadb.PersistentClient(path=CHROMA_PERSIST_DIR)
        _collection = client.get_or_create_collection(
            name="legal_precedents",
            metadata={"hnsw:space": "cosine"}
        )
        logger.info(f"ChromaDB collection loaded. Count: {_collection.count()}")
        
        # Seed with sample data if empty
        if _collection.count() == 0:
            _seed_sample_data()
    return _collection


def _seed_sample_data():
    """Seed the vector DB with sample historical precedents for demo."""
    sample_precedents = [
        {
            "case_number": "WP/1045/2023",
            "directive": "The Revenue Department is directed to consider the petitioner's representation and pass appropriate orders within 4 weeks.",
            "department_action_taken": "Compliance Report Filed",
            "outcome": "Resolved without Appeal"
        },
        {
            "case_number": "WP/8902/2022",
            "directive": "Respondents shall dispose of the petitioner's land representation within 30 days and communicate the decision.",
            "department_action_taken": "Appealed (Writ Appeal Filed)",
            "outcome": "Appeal Dismissed"
        },
        {
            "case_number": "WA/2301/2023",
            "directive": "The writ appeal is dismissed as barred by limitation under Section 5 of the Limitation Act.",
            "department_action_taken": "File Closed",
            "outcome": "Terminal — No further action"
        },
        {
            "case_number": "WP/5567/2021",
            "directive": "The State Government is directed to reinstate the petitioner in service within 8 weeks with all consequential benefits.",
            "department_action_taken": "Compliance — Reinstatement Order Issued",
            "outcome": "Complied within deadline"
        },
        {
            "case_number": "CRP/1123/2022",
            "directive": "The trial court is directed to dispose of the pending application within 2 months.",
            "department_action_taken": "Compliance Report Filed",
            "outcome": "Complied — Application disposed"
        },
        {
            "case_number": "WP/9981/2023",
            "directive": "The Commissioner of Police is directed to provide security to the petitioner within one week.",
            "department_action_taken": "Security Detail Assigned",
            "outcome": "Complied within deadline"
        },
        {
            "case_number": "WA/4412/2022",
            "directive": "We uphold the impugned order and dismiss the appeal. No costs.",
            "department_action_taken": "File Closed — SLP Considered",
            "outcome": "SLP filed within 90 days"
        },
        {
            "case_number": "WP/7654/2021",
            "directive": "The District Collector is directed to conduct a survey of the encroached land and submit a report within 6 weeks.",
            "department_action_taken": "Survey Conducted — Report Submitted",
            "outcome": "Resolved without Appeal"
        },
        {
            "case_number": "WP/3321/2023",
            "directive": "The petitioner's transfer order is stayed for a period of 4 weeks to enable consideration of the representation.",
            "department_action_taken": "Representation Considered",
            "outcome": "Transfer Order Modified"
        },
        {
            "case_number": "CRLA/890/2022",
            "directive": "The conviction and sentence of the appellant are set aside. The appellant shall be released forthwith.",
            "department_action_taken": "Release Order Issued",
            "outcome": "Complied — Appellant Released"
        },
    ]
    
    collection = _get_collection.__wrapped__() if hasattr(_get_collection, '__wrapped__') else _collection
    model = _get_embed_model()
    
    ids = []
    documents = []
    metadatas = []
    embeddings = []
    
    for i, p in enumerate(sample_precedents):
        ids.append(f"precedent_{i}")
        documents.append(p["directive"])
        metadatas.append({
            "case_number": p["case_number"],
            "department_action_taken": p["department_action_taken"],
            "outcome": p["outcome"]
        })
        embeddings.append(model.encode(p["directive"]).tolist())
    
    _collection.add(
        ids=ids,
        documents=documents,
        metadatas=metadatas,
        embeddings=embeddings
    )
    logger.info(f"Seeded {len(sample_precedents)} historical precedents into ChromaDB.")


def search_precedents(directive_text: str, top_k: int = 3) -> List[PrecedentMatch]:
    """
    Search the vector DB for historically similar directives.
    
    Args:
        directive_text: The extracted directive from the current case.
        top_k: Number of similar cases to return.
        
    Returns:
        List of PrecedentMatch objects sorted by similarity.
    """
    try:
        collection = _get_collection()
        model = _get_embed_model()
        
        query_embedding = model.encode(directive_text).tolist()
        
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k,
            include=["documents", "metadatas", "distances"]
        )
        
        precedents = []
        if results and results["documents"] and results["documents"][0]:
            for i in range(len(results["documents"][0])):
                # ChromaDB returns cosine distance, convert to similarity
                distance = results["distances"][0][i] if results["distances"] else 0
                similarity = round(1.0 - distance, 2)
                
                meta = results["metadatas"][0][i] if results["metadatas"] else {}
                
                precedents.append(PrecedentMatch(
                    case_number=meta.get("case_number", "Unknown"),
                    similarity_score=similarity,
                    historical_directive=results["documents"][0][i],
                    department_action_taken=meta.get("department_action_taken", "Unknown"),
                    outcome=meta.get("outcome", "Unknown")
                ))
        
        logger.info(f"Found {len(precedents)} precedents for directive: '{directive_text[:50]}...'")
        return precedents
        
    except Exception as e:
        logger.error(f"Precedent search failed: {str(e)}")
        return []
