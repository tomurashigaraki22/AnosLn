import fitz  # PyMuPDF
from googletrans import Translator
from fpdf import FPDF
import os

# Initialize the translator
translator = Translator()

# Function to read and translate PDF content
def read_and_translate_pdf(input_pdf_path, output_pdf_path):
    # Open the input PDF file
    doc = fitz.open(input_pdf_path)
    translated_text = ""

    # Iterate over each page
    for page_num in range(len(doc)):
        page = doc.load_page(page_num)
        text = page.get_text()

        # Translate the text from Japanese to English
        translated = translator.translate(text, src='ja', dest='en').text
        translated_text += translated + "\n\n"

    # Create a new PDF with the translated content
    pdf = FPDF()
    pdf.add_page()
    pdf.add_font('Ubuntu', '', 'Ubuntu.ttf', uni=True)
    pdf.set_font('Ubuntu', '', 12)

    # Split text into lines and ensure each line fits within the cell
    max_line_width = pdf.w - 20  # 10 units padding on each side
    for line in translated_text.split('\n'):
        while len(line) > 0:
            if pdf.get_string_width(line) <= max_line_width:
                pdf.multi_cell(0, 10, line)
                break
            else:
                # Find the position to split the line
                split_pos = 0
                while pdf.get_string_width(line[:split_pos]) <= max_line_width and split_pos < len(line):
                    split_pos += 1
                split_pos -= 1

                # Add the split line to the PDF
                pdf.multi_cell(0, 10, line[:split_pos])
                line = line[split_pos:].strip()
    pdf.output(output_pdf_path)

# Directory containing PDFs
input_dir = "./volumes"
output_dir = "./translatedvols"

if not os.path.exists(output_dir):
    os.makedirs(output_dir)

# Process each PDF in the directory
for i, filename in enumerate(os.listdir(input_dir), start=1):
    if filename.endswith(".pdf"):
        input_pdf_path = os.path.join(input_dir, filename)
        output_pdf_path = os.path.join(output_dir, f"volume_{i}.pdf")
        print(f"Processing {input_pdf_path} -> {output_pdf_path}")
        read_and_translate_pdf(input_pdf_path, output_pdf_path)

print("Translation complete.")
