import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { QdrantVectorStore } from "@langchain/qdrant";

const QDRANT_URL = process.env.QDRANT_URL || "http://localhost:6333";
const QDRANT_API_KEY = process.env.QDRANT_API_KEY || "";
const COLLECTION_NAME = process.env.QDRANT_COLLECTION_NAME || "notebooklm-docs";

/**
 * Get HuggingFace Embeddings instance
 * Using BAAI/bge-large-en-v1.5 which is an excellent open source embedding model
 */
function getEmbeddings() {
  return new HuggingFaceInferenceEmbeddings({
    apiKey: process.env.HF_TOKEN,
    model: "BAAI/bge-large-en-v1.5",
  });
}

/**
 * Ensure a payload index exists on a given field in the Qdrant collection.
 * This is required for filtered queries on Qdrant Cloud.
 * @param {string} fieldName - The payload field to index (e.g. "metadata.docId")
 * @param {string} fieldSchema - The schema type (e.g. "keyword", "integer")
 */
async function ensurePayloadIndex(fieldName, fieldSchema = "keyword") {
  try {
    const url = `${QDRANT_URL}/collections/${COLLECTION_NAME}/index`;
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(QDRANT_API_KEY && { "api-key": QDRANT_API_KEY }),
      },
      body: JSON.stringify({
        field_name: fieldName,
        field_schema: fieldSchema,
      }),
    });

    if (response.ok) {
      console.log(`📇 Payload index ensured for "${fieldName}"`);
    } else {
      const data = await response.json();
      // Index may already exist – that's fine
      console.warn(`⚠️ Index creation response for "${fieldName}":`, data?.status?.error || data);
    }
  } catch (err) {
    console.warn(`⚠️ Could not create payload index for "${fieldName}":`, err.message);
  }
}

/**
 * Store document chunks in Qdrant vector database
 * @param {Array} chunks - Array of chunked documents with metadata
 * @returns {Object} Vector store instance
 */
export async function storeEmbeddings(chunks) {
  const embeddings = getEmbeddings();

  console.log(`🔄 Generating embeddings for ${chunks.length} chunks...`);

  const vectorStore = await QdrantVectorStore.fromDocuments(chunks, embeddings, {
    url: QDRANT_URL,
    apiKey: QDRANT_API_KEY,
    collectionName: COLLECTION_NAME,
  });

  console.log(`✅ Stored ${chunks.length} chunks in Qdrant`);

  // Create payload index on metadata.docId so filtered queries work
  await ensurePayloadIndex("metadata.docId", "keyword");

  return vectorStore;
}

/**
 * Retrieve relevant chunks for a query
 * @param {string} query - User question
 * @param {number} topK - Number of chunks to retrieve (default: 4)
 * @param {string} docId - Optional document ID to filter by
 * @returns {Array} Retrieved document chunks
 */
export async function retrieveChunks(query, topK = 4, docId = null) {
  const embeddings = getEmbeddings();

  const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
    url: QDRANT_URL,
    apiKey: QDRANT_API_KEY,
    collectionName: COLLECTION_NAME,
  });

  let filter = undefined;
  if (docId) {
    filter = {
      must: [
        {
          key: "metadata.docId",
          match: { value: docId },
        },
      ],
    };
  }

  const retriever = vectorStore.asRetriever({
    k: topK,
    filter,
  });

  const results = await retriever.invoke(query);

  console.log(`🔍 Retrieved ${results.length} relevant chunks for query`);

  return results;
}

/**
 * Delete all vectors for a specific document
 * @param {string} docId - Document ID to delete
 */
export async function deleteDocumentVectors(docId) {
  try {
    const response = await fetch(`${QDRANT_URL}/collections/${COLLECTION_NAME}/points/delete`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        ...(QDRANT_API_KEY && { "api-key": QDRANT_API_KEY })
      },
      body: JSON.stringify({
        filter: {
          must: [
            {
              key: "metadata.docId",
              match: { value: docId },
            },
          ],
        },
      }),
    });

    if (!response.ok) {
      console.warn("Could not delete vectors:", await response.text());
    } else {
      console.log(`🗑️ Deleted vectors for document: ${docId}`);
    }
  } catch (err) {
    console.warn("Error deleting vectors:", err.message);
  }
}
