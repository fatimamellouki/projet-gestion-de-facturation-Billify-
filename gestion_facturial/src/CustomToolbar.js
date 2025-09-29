import React, { useState, useEffect } from 'react';
import { Quill } from 'react-quill';
import {
  Bold, Italic, Underline, Strikethrough,
  List as IconList, ListOrdered, Link, Trash
} from 'lucide-react';

// Liste personnalisée : CheckList
const List = Quill.import('formats/list');
const ListItem = Quill.import('formats/list/item');

class CheckList extends List {
  static formats(domNode) {
    const format = super.formats(domNode);
    if (domNode.classList.contains('ql-checklist')) {
      return 'checklist';
    }
    return format;
  }

  static create(value) {
    const node = super.create(value);
    if (value === 'checklist') {
      node.classList.add('ql-checklist');
    }
    return node;
  }
}

class CheckListItem extends ListItem {
  static create(value) {
    const node = super.create(value);
    if (value === 'checklist') {
      node.classList.add('ql-checklist-item');
    }
    return node;
  }
}

// Enregistrement des formats
Quill.register('formats/list', CheckList, true);
Quill.register('formats/list/item', CheckListItem, true);

export default function CustomToolbar({ id, quill }) {
  const [formats, setFormats] = useState({});

  useEffect(() => {
    if (!quill) return;
    const editor = quill.getEditor();

    const updateFormats = (range) => {
      setFormats(range ? editor.getFormat(range) : {});
    };

    editor.on('selection-change', updateFormats);
    return () => editor.off('selection-change', updateFormats);
  }, [quill]);

//   const toggleList = (type) => {
//     if (!quill) return;
//     const editor = quill.getEditor();
//     const range = editor.getSelection();
//     if (!range) return;

//     const currentFormat = editor.getFormat(range);
//     const newValue = currentFormat.list === type ? false : type;

//     if (type === 'checklist') {
//       editor.format('list', newValue);
//     const [line] = editor.getLine(range.index);
// if (line?.domNode) {
//     line.domNode.classList.add('ql-checklist');
//   line.domNode.classList.add('ql-checklist-item');
// } else {
//           line.domNode.classList.remove('ql-checklist');
//           line.domNode.classList.remove('ql-checklist-item');
//         }
//     } else {
//       editor.format('list', newValue);
//     }
//   };

const toggleList = (type) => {
  if (!quill) return;
  const editor = quill.getEditor();
  const range = editor.getSelection();
  if (!range) return;

  const currentFormat = editor.getFormat(range);
  const newValue = currentFormat.list === type ? false : type;

  editor.format('list', newValue);

  if (type === 'checklist') {
    // Attendre que Quill applique le format
    requestAnimationFrame(() => {
      const [line] = editor.getLine(range.index);
      if (line?.domNode) {
        line.domNode.classList.add('ql-checklist');
        line.domNode.classList.add('ql-checklist-item');
      } else {
        line.domNode.classList.remove('ql-checklist');
        line.domNode.classList.remove('ql-checklist-item');
      }
    });
  }
};
 const toggleFormat = (formatType, value = null) => {
    if (!quill) return;
    const editor = quill.getEditor();
    const range = editor.getSelection();
    if (!range) return;

    if (formatType === 'link' && value === null) {
      const url = prompt('Entrez l\'URL du lien :', 'https://');
      if (url === null) return;
      editor.format('link', url || false);
      return;
    }

    const currentFormat = editor.getFormat(range);
    const newValue = value !== null ? value : !currentFormat[formatType];
    editor.format(formatType, newValue);
  };

  const clearFormatting = () => {
    if (!quill) return;
    const editor = quill.getEditor();
    const range = editor.getSelection();
    if (range) editor.removeFormat(range.index, range.length);
  };

  const isActive = (format) => {
    if (format === 'bullet') return formats.list === 'bullet';
    if (format === 'ordered') return formats.list === 'ordered';
    if (format === 'checklist') return formats.list === 'checklist';
    return !!formats[format];
  };

  return (
    <>
      <style>{`
        .ql-editor ul {
          list-style-type: disc;
          padding-left: 1.5em;
        }

        .ql-editor ol {
          list-style-type: decimal;
          padding-left: 1.5em;
        }

        .ql-checklist {
          list-style-type: none;
          padding-left: 1.5em;
        }

        .ql-checklist-item::before {
          content: "✓";
          color: #000000;
          font-weight: bold;
          display: inline-block;
          width: 1em;
          margin-left: -0.5em;
        }
      `}</style>

      <div
        id={id}
        className="flex items-center gap-2 border border-gray-300 rounded px-2 py-1 bg-white shadow-sm"
        role="toolbar"
        aria-label="Custom Quill toolbar"
      >
        <button
          type="button"
          onClick={() => toggleFormat('bold')}
          className={`p-1 rounded hover:bg-gray-200 ${isActive('bold') ? 'bg-blue-200' : ''}`}
          aria-label="Gras"
          title="Gras (Ctrl+B)"
        >
          <Bold size={18} />
        </button>
        <button
          type="button"
          onClick={() => toggleFormat('italic')}
          className={`p-1 rounded hover:bg-gray-200 ${isActive('italic') ? 'bg-blue-200' : ''}`}
          aria-label="Italique"
          title="Italique (Ctrl+I)"
        >
          <Italic size={18} />
        </button>
        <button
          type="button"
          onClick={() => toggleFormat('underline')}
          className={`p-1 rounded hover:bg-gray-200 ${isActive('underline') ? 'bg-blue-200' : ''}`}
          aria-label="Souligné"
          title="Souligné (Ctrl+U)"
        >
          <Underline size={18} />
        </button>
        <button
          type="button"
          onClick={() => toggleFormat('strike')}
          className={`p-1 rounded hover:bg-gray-200 ${isActive('strike') ? 'bg-blue-200' : ''}`}
          aria-label="Barré"
          title="Barré"
        >
          <Strikethrough size={18} />
        </button>
        <button
          type="button"
          onClick={() => toggleList('bullet')}
          className={`p-1 rounded hover:bg-gray-200 ${isActive('bullet') ? 'bg-blue-200' : ''}`}
          aria-label="Liste à puces"
          title="Liste à puces"
        >
          <IconList size={18} />
        </button>
        <button
          type="button"
          onClick={() => toggleList('ordered')}
          className={`p-1 rounded hover:bg-gray-200 ${isActive('ordered') ? 'bg-blue-200' : ''}`}
          aria-label="Liste numérotée"
          title="Liste numérotée"
        >
          <ListOrdered size={18} />
        </button>
        <button
          type="button"
          onClick={() => toggleList('checklist')}
          className={`p-1 rounded hover:bg-gray-200 ${isActive('checklist') ? 'bg-blue-200' : ''} `}
          aria-label="Liste avec coche"
          title="Liste avec coche"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <path d="M9 12l2 2 4-4" />
          </svg>
        </button>
        <button
          type="button"
          onClick={clearFormatting}
          className="p-1 rounded hover:bg-red-100 text-red-600"
          aria-label="Effacer le formatage"
          title="Effacer le formatage"
        >
          <Trash size={18} />
        </button>
      </div>
    </>
  );
}
