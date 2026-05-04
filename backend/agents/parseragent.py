import fitz  # PyMuPDF
from typing import List, Dict, Any
from core.schemas import TextBlock, GraphState

def parse_pdf_node(state: GraphState) -> Dict[str, Any]:
    """
    Parses the PDF and extracts text blocks with bounding boxes.
    Updates the state with parsed_blocks and full_text.
    """
    pdf_path = state["pdf_path"]
    doc = fitz.open(pdf_path)
    
    parsed_blocks: List[TextBlock] = []
    full_text_pieces = []

    for page_num in range(len(doc)):
        page = doc[page_num]
        # extract_dict returns blocks containing lines, which contain spans (words)
        # Using blocks directly is often good enough for sentence/paragraph level
        blocks = page.get_text("dict")["blocks"]
        
        for b_idx, b in enumerate(blocks):
            if "lines" in b:  # Text block
                block_text = ""
                for line in b["lines"]:
                    for span in line["spans"]:
                        block_text += span["text"] + " "
                # Sanitize the string to remove null bytes and irregular whitespaces
                block_text = block_text.replace('\u0000', '').replace('\x00', '').strip()
                
                if block_text:
                    parsed_blocks.append(TextBlock(
                        text=block_text,
                        page_num=page_num + 1,
                        bbox=b["bbox"],
                        paragraph_id=f"p{page_num + 1}_b{b_idx}"
                    ))
                    full_text_pieces.append(block_text)

    doc.close()
    
    full_text = "\n\n".join(full_text_pieces)
    
    return {"parsed_blocks": parsed_blocks, "full_text": full_text}
