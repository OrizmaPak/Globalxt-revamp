import { useState, useEffect } from 'react';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { $getRoot } from 'lexical';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { HeadingNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';
import { PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

// Toolbar component
const ToolbarPlugin = () => {
  const [editor] = useLexicalComposerContext();

  const formatText = (command: string) => {
    editor.dispatchCommand(command as any, undefined);
  };

  return (
    <div className="border-b border-gray-200 p-2 flex items-center gap-2 bg-gray-50 rounded-t-lg">
      <button
        type="button"
        onClick={() => formatText('FORMAT_TEXT_COMMAND')}
        className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border font-bold"
        title="Bold"
      >
        B
      </button>
      <button
        type="button"
        onClick={() => formatText('FORMAT_TEXT_COMMAND')}
        className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border italic"
        title="Italic"
      >
        I
      </button>
      <div className="w-px h-4 bg-gray-300" />
      <span className="text-xs text-gray-500">Use Ctrl+B for bold, Ctrl+I for italic</span>
    </div>
  );
};

// Plugin to sync content with parent component
const SyncPlugin = ({ 
  onChange, 
  initialValue 
}: { 
  onChange: (html: string) => void; 
  initialValue: string;
}) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // Set initial content
    if (initialValue) {
      editor.update(() => {
        const parser = new DOMParser();
        const dom = parser.parseFromString(initialValue, 'text/html');
        const nodes = $generateNodesFromDOM(editor, dom);
        const root = $getRoot();
        root.clear();
        root.append(...nodes);
      });
    }
  }, [editor, initialValue]);

  useEffect(() => {
    const unregister = editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const html = $generateHtmlFromNodes(editor, null);
        onChange(html);
      });
    });

    return unregister;
  }, [editor, onChange]);

  return null;
};

interface InlineRichEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
  required?: boolean;
}

const InlineRichEditor = ({
  value,
  onChange,
  placeholder = 'Enter formatted text...',
  className = '',
  label,
  required = false
}: InlineRichEditorProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  const handleEdit = () => {
    setTempValue(value);
    setIsEditing(true);
  };

  const handleSave = () => {
    onChange(tempValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempValue(value);
    setIsEditing(false);
  };

  const initialConfig = {
    namespace: 'InlineRichEditor',
    theme: {
      root: 'p-3 border-none rounded-b-lg min-h-[120px] max-h-[400px] overflow-y-auto focus:outline-none',
      text: {
        bold: 'font-semibold',
        italic: 'italic',
        underline: 'underline',
      },
      paragraph: 'mb-2 last:mb-0',
      list: {
        nested: {
          listitem: 'list-item',
        },
        ol: 'list-decimal list-inside',
        ul: 'list-disc list-inside',
      },
    },
    nodes: [HeadingNode, ListNode, ListItemNode],
    onError: (error: Error) => {
      console.error('Lexical error:', error);
    },
  };

  // Strip HTML for plain text display
  const getPlainText = (html: string) => {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
  };

  const isEmpty = !value || !getPlainText(value);

  if (isEditing) {
    return (
      <div className={`group relative ${className}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <div className="border-2 border-brand-primary rounded-lg overflow-hidden bg-white">
          <LexicalComposer initialConfig={initialConfig}>
            <ToolbarPlugin />
            <div className="relative">
              <RichTextPlugin
                contentEditable={
                  <ContentEditable className="resize-none text-sm leading-relaxed focus:outline-none" />
                }
                placeholder={
                  <div className="absolute top-3 left-3 text-gray-400 text-sm pointer-events-none">
                    {placeholder}
                  </div>
                }
                ErrorBoundary={LexicalErrorBoundary}
              />
              <HistoryPlugin />
              <SyncPlugin onChange={setTempValue} initialValue={tempValue} />
            </div>
          </LexicalComposer>
        </div>
        <div className="flex justify-end gap-2 mt-2">
          <button
            onClick={handleCancel}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors"
          >
            <XMarkIcon className="h-4 w-4" />
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <CheckIcon className="h-4 w-4" />
            Save
          </button>
        </div>
        <div className="mt-1 text-xs text-gray-500">
          Use Ctrl+B for bold, Ctrl+I for italic. Click Save when done.
        </div>
      </div>
    );
  }

  return (
    <div className={`group relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div
        className={`cursor-pointer rounded-lg border-2 border-dashed border-transparent bg-gray-50 px-3 py-2 min-h-[120px] transition-all hover:border-brand-primary hover:bg-brand-primary/5 ${
          isEmpty ? 'text-gray-400 italic' : 'text-gray-900'
        }`}
        onClick={handleEdit}
      >
        <div className="flex items-start justify-between">
          <div 
            className="flex-1 whitespace-pre-wrap leading-relaxed"
            dangerouslySetInnerHTML={{ __html: value || `<span class="text-gray-400 italic">${placeholder}</span>` }}
          />
          <PencilIcon className="ml-2 h-4 w-4 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100 flex-shrink-0 mt-1" />
        </div>
      </div>
    </div>
  );
};

export default InlineRichEditor;