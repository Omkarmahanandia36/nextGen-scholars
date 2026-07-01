import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

function safePdfStr(text: string): string {
  if (!text) return "";
  const replacements: { [key: string]: string } = {
    "\u201c": '"', "\u201d": '"',
    "\u2018": "'", "\u2019": "'",
    "\u2013": "-", "\u2014": "-",
    "\u2212": "-",
    "\u00a0": " ",
  };
  let result = text;
  for (const [uni, ascii] of Object.entries(replacements)) {
    result = result.replaceAll(uni, ascii);
  }
  return result;
}

class PdfLayoutManager {
  public doc: PDFDocument;
  public currentPage: any;
  public currentY: number = 0;
  public margin: number = 50;
  public width: number = 0;
  public height: number = 0;
  public font: any;
  public fontBold: any;
  public fontItalic: any;

  constructor(doc: PDFDocument, font: any, fontBold: any, fontItalic: any) {
    this.doc = doc;
    this.font = font;
    this.fontBold = fontBold;
    this.fontItalic = fontItalic;
    this.addNewPage();
  }

  public addNewPage() {
    this.currentPage = this.doc.addPage();
    const size = this.currentPage.getSize();
    this.width = size.width;
    this.height = size.height;
    this.currentY = this.height - this.margin;
  }

  public drawText(text: string, options: { fontSize?: number; fontType?: 'regular' | 'bold' | 'italic'; lineSpacing?: number; align?: 'left' | 'center' | 'right'; color?: [number, number, number] } = {}) {
    const fontSize = options.fontSize || 10;
    const lineSpacing = options.lineSpacing || 1.25;
    const font = options.fontType === 'bold' ? this.fontBold : options.fontType === 'italic' ? this.fontItalic : this.font;
    const textRGB = options.color ? rgb(options.color[0]/255, options.color[1]/255, options.color[2]/255) : rgb(0, 0, 0);

    const maxTextWidth = this.width - 2 * this.margin;
    const paragraphs = safePdfStr(text).split('\n');
    
    for (const paragraph of paragraphs) {
      const words = paragraph.split(' ');
      let currentLine = '';
      const lines: string[] = [];

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = font.widthOfTextAtSize(testLine, fontSize);
        if (testWidth > maxTextWidth) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) {
        lines.push(currentLine);
      }

      const step = fontSize * lineSpacing;
      for (const line of lines) {
        if (this.currentY - step < this.margin) {
          this.addNewPage();
        }
        
        let x = this.margin;
        if (options.align === 'center') {
          const lineWidth = font.widthOfTextAtSize(line, fontSize);
          x = (this.width - lineWidth) / 2;
        } else if (options.align === 'right') {
          const lineWidth = font.widthOfTextAtSize(line, fontSize);
          x = this.width - this.margin - lineWidth;
        }

        this.currentPage.drawText(line, {
          x,
          y: this.currentY - fontSize,
          size: fontSize,
          font,
          color: textRGB,
        });
        
        this.currentY -= step;
      }
    }
  }

  public addSpacing(points: number) {
    if (this.currentY - points < this.margin) {
      this.addNewPage();
    } else {
      this.currentY -= points;
    }
  }

  public drawHorizontalLine() {
    if (this.currentY - 10 < this.margin) {
      this.addNewPage();
    }
    this.currentPage.drawLine({
      start: { x: this.margin, y: this.currentY },
      end: { x: this.width - this.margin, y: this.currentY },
      thickness: 1,
      color: rgb(0.7, 0.7, 0.7),
    });
    this.currentY -= 15;
  }

  public drawCandidateDetails() {
    const fontSize = 10;
    const font = this.font;
    const step = fontSize * 1.5;
    const textRGB = rgb(0.3, 0.3, 0.3);
    
    if (this.currentY - 2 * step < this.margin) {
      this.addNewPage();
    }
    
    const colW = (this.width - 2 * this.margin) / 2;
    
    // Row 1
    this.currentPage.drawText("Candidate Name: ___________________________________", { x: this.margin, y: this.currentY - fontSize, size: fontSize, font, color: textRGB });
    this.currentPage.drawText("Date: ________________________", { x: this.margin + colW, y: this.currentY - fontSize, size: fontSize, font, color: textRGB });
    this.currentY -= step;
    
    // Row 2
    this.currentPage.drawText("Class/Section:  ___________________________________", { x: this.margin, y: this.currentY - fontSize, size: fontSize, font, color: textRGB });
    this.currentPage.drawText("Score:  _______ / _______", { x: this.margin + colW, y: this.currentY - fontSize, size: fontSize, font, color: textRGB });
    this.currentY -= step;
  }

  public drawMcqOptions(options: { A: string; B: string; C: string; D: string }) {
    const fontSize = 10;
    const font = this.font;
    const optA = `A. ${safePdfStr(options.A)}`;
    const optB = `B. ${safePdfStr(options.B)}`;
    const optC = `C. ${safePdfStr(options.C)}`;
    const optD = `D. ${safePdfStr(options.D)}`;

    const lenA = font.widthOfTextAtSize(optA, fontSize);
    const lenB = font.widthOfTextAtSize(optB, fontSize);
    const lenC = font.widthOfTextAtSize(optC, fontSize);
    const lenD = font.widthOfTextAtSize(optD, fontSize);
    const maxLen = Math.max(lenA, lenB, lenC, lenD);

    const wTotal = this.width - 2 * this.margin;
    const step = fontSize * 1.5;

    if (maxLen <= wTotal / 4 - 10) {
      // 4 columns in one row
      if (this.currentY - step < this.margin) {
        this.addNewPage();
      }
      const colW = wTotal / 4;
      this.currentPage.drawText(optA, { x: this.margin, y: this.currentY - fontSize, size: fontSize, font });
      this.currentPage.drawText(optB, { x: this.margin + colW, y: this.currentY - fontSize, size: fontSize, font });
      this.currentPage.drawText(optC, { x: this.margin + 2 * colW, y: this.currentY - fontSize, size: fontSize, font });
      this.currentPage.drawText(optD, { x: this.margin + 3 * colW, y: this.currentY - fontSize, size: fontSize, font });
      this.currentY -= step;
    } else if (maxLen <= wTotal / 2 - 10) {
      // 2 columns, 2 rows
      if (this.currentY - 2 * step < this.margin) {
        this.addNewPage();
      }
      const colW = wTotal / 2;
      // Row 1
      this.currentPage.drawText(optA, { x: this.margin, y: this.currentY - fontSize, size: fontSize, font });
      this.currentPage.drawText(optB, { x: this.margin + colW, y: this.currentY - fontSize, size: fontSize, font });
      this.currentY -= step;
      // Row 2
      this.currentPage.drawText(optC, { x: this.margin, y: this.currentY - fontSize, size: fontSize, font });
      this.currentPage.drawText(optD, { x: this.margin + colW, y: this.currentY - fontSize, size: fontSize, font });
      this.currentY -= step;
    } else {
      // 1 column (vertical block)
      this.drawText(optA, { fontSize, fontType: 'regular' });
      this.drawText(optB, { fontSize, fontType: 'regular' });
      this.drawText(optC, { fontSize, fontType: 'regular' });
      this.drawText(optD, { fontSize, fontType: 'regular' });
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const questions = body.questions || [];
    const includeAnswers = body.include_answers !== false;

    const pdfDoc = await PDFDocument.create();
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    const layout = new PdfLayoutManager(pdfDoc, fontRegular, fontBold, fontItalic);

    // Title & Header Section
    if (!includeAnswers) {
      layout.drawText("QUIZ / EXAMINATION", { fontSize: 18, fontType: 'bold', align: 'center' });
      layout.addSpacing(10);
      layout.drawCandidateDetails();
      layout.addSpacing(15);
      layout.drawHorizontalLine();
    } else {
      layout.drawText("QUIZ ANSWER KEY & EXPLANATIONS", { fontSize: 18, fontType: 'bold', align: 'center' });
      layout.addSpacing(5);
      layout.drawText("Reference guide generated by QuizForge AI", { fontSize: 10, fontType: 'italic', align: 'center', color: [100, 100, 100] });
      layout.addSpacing(15);
      layout.drawHorizontalLine();
    }

    // Group questions by type to form sections
    const mcqs = questions.filter((q: any) => q.question_type === "MCQ");
    const oneMark = questions.filter((q: any) => q.question_type === "1_mark");
    const twoMark = questions.filter((q: any) => q.question_type === "2_mark");
    const fiveMark = questions.filter((q: any) => q.question_type === "5_mark");

    const sections = [];
    if (mcqs.length > 0) sections.push({ name: "Multiple Choice Questions", questions: mcqs, marks: 1 });
    if (oneMark.length > 0) sections.push({ name: "Very Short Answer Questions", questions: oneMark, marks: 1 });
    if (twoMark.length > 0) sections.push({ name: "Short Answer Questions", questions: twoMark, marks: 2 });
    if (fiveMark.length > 0) sections.push({ name: "Long Answer Questions", questions: fiveMark, marks: 5 });

    const romanNumerals = ["I", "II", "III", "IV"];
    let sectionIdx = 0;

    for (const sec of sections) {
      const rom = romanNumerals[sectionIdx] || (sectionIdx + 1).toString();
      const titleText = `${rom}. ${sec.name}`;
      const marksText = `(${sec.marks} x ${sec.questions.length} = ${sec.marks * sec.questions.length} Marks)`;

      // Write Section Header
      const wTotal = layout.width - 2 * layout.margin;
      const wMarks = fontBold.widthOfTextAtSize(marksText, 12);
      
      if (layout.currentY - 25 < layout.margin) {
        layout.addNewPage();
      }

      layout.currentPage.drawText(safePdfStr(titleText), {
        x: layout.margin,
        y: layout.currentY - 12,
        size: 12,
        font: fontBold,
      });

      layout.currentPage.drawText(safePdfStr(marksText), {
        x: layout.width - layout.margin - wMarks,
        y: layout.currentY - 12,
        size: 12,
        font: fontBold,
      });

      layout.currentY -= 20;
      layout.addSpacing(5);
      sectionIdx++;

      // Print questions in this section
      let qIdx = 0;
      for (const q of sec.questions) {
        const questionLabel = `${qIdx + 1}. ${q.question}`;
        layout.drawText(questionLabel, { fontSize: 11, fontType: 'regular' });
        layout.addSpacing(4);

        if (q.question_type === "MCQ" && q.options) {
          layout.drawMcqOptions(q.options);
          layout.addSpacing(6);

          if (includeAnswers) {
            layout.drawText(`Correct Answer: ${q.correct_answer}`, { fontSize: 10, fontType: 'bold' });
            layout.addSpacing(3);

            if (q.explanations) {
              const explText = `Option Explanations:\n  A: ${q.explanations.A}\n  B: ${q.explanations.B}\n  C: ${q.explanations.C}\n  D: ${q.explanations.D}`;
              layout.drawText(explText, { fontSize: 9, fontType: 'italic', color: [100, 100, 100] });
            }
            layout.addSpacing(8);
          }
        } else {
          // Non-MCQ question
          layout.addSpacing(4);

          if (includeAnswers) {
            layout.drawText("Suggested Answer / Model Answer:", { fontSize: 10, fontType: 'bold' });
            layout.addSpacing(3);
            layout.drawText(q.correct_answer || "", { fontSize: 10, fontType: 'regular' });
            layout.addSpacing(4);

            if (q.explanation) {
              layout.drawText(`Marking Criteria & Explanation:\n${q.explanation}`, { fontSize: 9, fontType: 'italic', color: [100, 100, 100] });
            }
            layout.addSpacing(8);
          }
        }
        layout.addSpacing(6);
        qIdx++;
      }
      layout.addSpacing(15);
    }

    const pdfBytes = await pdfDoc.save();

    return new Response(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="quiz_forge.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("PDF Generation Error:", error);
    return NextResponse.json({ detail: error.message || "Failed to generate PDF." }, { status: 500 });
  }
}
