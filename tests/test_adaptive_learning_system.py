import pytest
import os
from datetime import datetime
from src.learning.systems.adaptive import RapidAdaptiveLearningSystem

@pytest.fixture
def learning_system():
    """Fixture to create a learning system for testing"""
    # Use test-specific Pinecone API key or mock
    return RapidAdaptiveLearningSystem(
        pinecone_api_key=os.getenv('TEST_PINECONE_API_KEY')
    )

def test_record_learning_event(learning_system):
    """Test basic learning event recording"""
    content = "def process_data(input_params):"
    learning_system.record_learning_event(
        content=content,
        metadata={'test': 'unit_test'},
        feedback_type='code_generation'
    )
    
    # Verify event can be retrieved
    similar_events = learning_system.find_similar_events(
        query="data processing function",
        top_k=1
    )
    
    assert len(similar_events) > 0, "Failed to record or retrieve learning event"
    assert similar_events[0]['metadata'].get('test') == 'unit_test'

def test_find_similar_events(learning_system):
    """Test semantic search capabilities"""
    # Prepare multiple learning events
    test_events = [
        "def process_user_data(params):",
        "def analyze_customer_information(data):",
        "class DataProcessor:"
    ]
    
    for event in test_events:
        learning_system.record_learning_event(
            content=event,
            metadata={'source': 'test_suite'}
        )
    
    # Search for similar events
    similar_events = learning_system.find_similar_events(
        query="data processing function",
        top_k=3,
        filter_metadata={'source': 'test_suite'}
    )
    
    assert len(similar_events) > 0, "Failed to find similar events"
    assert all('source' in event['metadata'] for event in similar_events)

def test_metadata_filtering(learning_system):
    """Test advanced metadata filtering"""
    learning_system.record_learning_event(
        content="def process_user_data(params):",
        metadata={
            'agent': 'ScribeAgent',
            'complexity': 'low'
        },
        feedback_type='code_generation'
    )
    
    # Filter by specific metadata
    filtered_events = learning_system.find_similar_events(
        query="user data processing",
        top_k=1,
        filter_metadata={'agent': 'ScribeAgent'}
    )
    
    assert len(filtered_events) > 0
    assert filtered_events[0]['metadata']['agent'] == 'ScribeAgent'

def test_embedding_consistency(learning_system):
    """Verify embedding consistency"""
    content1 = "def process_data(input_params):"
    content2 = "def process_data(input_params):"
    
    learning_system.record_learning_event(content1)
    learning_system.record_learning_event(content2)
    
    similar_events = learning_system.find_similar_events(
        query=content1,
        top_k=2
    )
    
    assert len(similar_events) == 2
    assert similar_events[0]['similarity'] > 0.99

def test_performance_basic(learning_system, benchmark):
    """Basic performance benchmark for event recording"""
    def record_event():
        learning_system.record_learning_event(
            content="def benchmark_function():",
            metadata={'test': 'performance'}
        )
    
    result = benchmark(record_event)
    assert result is not None

def test_error_handling():
    """Test system behavior with invalid inputs"""
    with pytest.raises(TypeError):
        RapidAdaptiveLearningSystem(pinecone_api_key=123)  # Invalid key type
    
    learning_system = RapidAdaptiveLearningSystem()
    
    with pytest.raises(ValueError):
        learning_system.record_learning_event(content="")  # Empty content

# Machine Learning Enhancement Tests
def test_ml_embedding_quality(learning_system):
    """Experimental test for embedding quality"""
    # Prepare diverse code snippets
    code_snippets = [
        "def process_user_data(params):",
        "class UserDataProcessor:",
        "def analyze_customer_information(data):"
    ]
    
    # Record events
    for snippet in code_snippets:
        learning_system.record_learning_event(snippet)
    
    # Search with a query
    similar_events = learning_system.find_similar_events(
        query="data processing function",
        top_k=3
    )
    
    # Basic quality checks
    assert len(similar_events) > 0
    assert all(event['similarity'] > 0.5 for event in similar_events)

# Potential Machine Learning Enhancements
def test_ml_enhancement_placeholder():
    """Placeholder for future ML enhancement tests"""
    # TODO: Implement more advanced ML testing strategies
    assert True, "Placeholder for future machine learning tests"
