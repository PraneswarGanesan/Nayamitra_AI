from langgraph.graph import StateGraph, END
from backend.core.schemas import GraphState
from backend.agents.parseragent import parse_pdf_node
from backend.agents.operative_agent import extract_operative_portion_node
from backend.agents.extractor_agent import extract_metadata_node
from backend.agents.drective_agent import extract_directives_node
from backend.agents.human_loop_agent import format_verification_data_node

def create_pipeline():
    workflow = StateGraph(GraphState)
    
    # Add nodes
    workflow.add_node("parse_pdf", parse_pdf_node)
    workflow.add_node("extract_metadata", extract_metadata_node)
    workflow.add_node("extract_operative", extract_operative_portion_node)
    workflow.add_node("extract_directives", extract_directives_node)
    workflow.add_node("format_verification", format_verification_data_node)
    
    # Define edges
    workflow.set_entry_point("parse_pdf")
    
    # After parsing, we can do metadata and operative in parallel, but LangGraph
    # standard edges are sequential. We'll do sequential for simplicity here.
    workflow.add_edge("parse_pdf", "extract_metadata")
    workflow.add_edge("extract_metadata", "extract_operative")
    workflow.add_edge("extract_operative", "extract_directives")
    workflow.add_edge("extract_directives", "format_verification")
    
    workflow.add_edge("format_verification", END)
    
    # Compile
    app = workflow.compile()
    return app
