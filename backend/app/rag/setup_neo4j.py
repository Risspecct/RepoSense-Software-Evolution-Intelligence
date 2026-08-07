from app.graph.neo4j_client import neo4j_client

def setup_indexes():
    neo4j_client.connect()
    
    # 1. Index for Classes
    class_index_query = """
    CREATE VECTOR INDEX `class_vector_index` IF NOT EXISTS
    FOR (c:Class) ON (c.embedding)
    OPTIONS {indexConfig: {
     `vector.dimensions`: 384,
     `vector.similarity_function`: 'cosine'
    }}
    """
    
    # 2. Index for Methods
    method_index_query = """
    CREATE VECTOR INDEX `method_vector_index` IF NOT EXISTS
    FOR (m:Method) ON (m.embedding)
    OPTIONS {indexConfig: {
     `vector.dimensions`: 384,
     `vector.similarity_function`: 'cosine'
    }}
    """
    
    print("Creating Vector Indexes...")
    neo4j_client.execute_query(class_index_query)
    neo4j_client.execute_query(method_index_query)
    print("Indexes created successfully.")

if __name__ == "__main__":
    setup_indexes()