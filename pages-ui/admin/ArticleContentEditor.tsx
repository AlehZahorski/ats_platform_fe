"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold, Italic, List, ListOrdered, Heading2, Heading3, Quote, Code,
} from "lucide-react";
import { useEffect } from "react";

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

/** Rich-text editor for article bodies. Wider toolbar than the generic
 * RichTextEditor — articles need H2/H3 to break up long copy. Output is
 * HTML, stored verbatim, rendered with dangerouslySetInnerHTML on the
 * public side (same trust boundary as job descriptions). */
export function ArticleContentEditor({
  value, onChange, placeholder, minHeight = 320,
}: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      // StarterKit ships h1–h6; we constrain the toolbar to h2/h3
      // because the page already renders the article title as h1.
      StarterKit,
      Placeholder.configure({ placeholder: placeholder ?? "Zacznij pisać artykuł…" }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html === "<p></p>" ? "" : html);
    },
    editorProps: {
      attributes: {
        // Match the read-side typography roughly so the editor feels
        // WYSIWYG — small differences are fine, identical fonts/spacing
        // would over-promise on layout-level precision we don't have.
        class:
          "outline-none text-[15px] leading-relaxed text-foreground/90 prose-headings:font-semibold",
      },
    },
  });

  // External value changes (e.g. opening a different article) should
  // replace editor content, but not while the user is typing.
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const incoming = value || "";
    if (current !== incoming && !editor.isFocused) {
      editor.commands.setContent(incoming);
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className="border border-border rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-amber-400/40">
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-border bg-muted/30 flex-wrap">
        <TBtn
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
          title="Nagłówek H2"
        >
          <Heading2 className="w-4 h-4" />
        </TBtn>
        <TBtn
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive("heading", { level: 3 })}
          title="Nagłówek H3"
        >
          <Heading3 className="w-4 h-4" />
        </TBtn>
        <Sep />
        <TBtn
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Pogrubienie"
        >
          <Bold className="w-3.5 h-3.5" />
        </TBtn>
        <TBtn
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Kursywa"
        >
          <Italic className="w-3.5 h-3.5" />
        </TBtn>
        <Sep />
        <TBtn
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Lista punktowana"
        >
          <List className="w-3.5 h-3.5" />
        </TBtn>
        <TBtn
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Lista numerowana"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </TBtn>
        <Sep />
        <TBtn
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="Cytat"
        >
          <Quote className="w-3.5 h-3.5" />
        </TBtn>
        <TBtn
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive("code")}
          title="Kod inline"
        >
          <Code className="w-3.5 h-3.5" />
        </TBtn>
      </div>

      {/* Make headings + lists actually look like what they are inside
          the editor — TipTap won't style them by default. */}
      <div
        style={{ minHeight }}
        className="px-4 py-3 text-sm
                   [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-4 [&_h2]:mb-2
                   [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-2
                   [&_p]:my-2
                   [&_ul]:my-2 [&_ul]:pl-6 [&_ul]:list-disc
                   [&_ol]:my-2 [&_ol]:pl-6 [&_ol]:list-decimal
                   [&_blockquote]:border-l-2 [&_blockquote]:border-amber-400 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:my-2
                   [&_code]:text-xs [&_code]:bg-muted/50 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded"
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}


function TBtn({
  onClick, active, title, children,
}: { onClick: () => void; active?: boolean; title?: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => {
        // mousedown + preventDefault keeps the editor focused — otherwise
        // clicking the toolbar would deselect text and break the toggle.
        e.preventDefault();
        onClick();
      }}
      className={`p-1.5 rounded text-sm transition-colors ${
        active
          ? "bg-amber-400/15 text-amber-400"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      }`}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <div className="w-px h-4 bg-border mx-1" />;
}
