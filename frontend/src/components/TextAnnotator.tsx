import React, { useState, useRef, useCallback, useEffect } from 'react';

interface Annotation {
  id: number;
  start_index: number;
  end_index: number;
  selected_text: string;
  comment: string;
  created_at: string;
}

interface TextAnnotatorProps {
  textId: number;
  content: string;
  annotations: Annotation[];
  onAnnotationCreate: (annotation: Omit<Annotation, 'id' | 'created_at'>) => void;
  onAnnotationUpdate: (id: number, comment: string) => void;
  onAnnotationDelete: (id: number) => void;
}

const TextAnnotator: React.FC<TextAnnotatorProps> = ({
  textId,
  content,
  annotations,
  onAnnotationCreate,
  onAnnotationUpdate,
  onAnnotationDelete,
}) => {
  const textRef = useRef<HTMLDivElement>(null);
  const [selectedRange, setSelectedRange] = useState<{
    start: number;
    end: number;
    text: string;
  } | null>(null);
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [editingAnnotation, setEditingAnnotation] = useState<number | null>(null);

  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const selectedText = selection.toString().trim();
    
    if (selectedText.length === 0) return;

    // Calculate character indices in the original text
    const startContainer = range.startContainer;
    const endContainer = range.endContainer;
    
    // Get text content before the selection
    const textElement = textRef.current;
    if (!textElement) return;

    const textContent = textElement.textContent || '';
    const selectedStart = textContent.indexOf(selectedText);
    
    if (selectedStart === -1) return;

    const selectedEnd = selectedStart + selectedText.length;

    setSelectedRange({
      start: selectedStart,
      end: selectedEnd,
      text: selectedText,
    });
    setShowCommentDialog(true);
    setCommentText('');
  }, []);

  const handleCreateAnnotation = () => {
    if (!selectedRange) return;

    const newAnnotation = {
      start_index: selectedRange.start,
      end_index: selectedRange.end,
      selected_text: selectedRange.text,
      comment: commentText,
    };

    onAnnotationCreate(newAnnotation);
    setShowCommentDialog(false);
    setSelectedRange(null);
    setCommentText('');

    // Clear selection
    window.getSelection()?.removeAllRanges();
  };

  const handleEditAnnotation = (annotation: Annotation) => {
    setEditingAnnotation(annotation.id);
    setCommentText(annotation.comment);
  };

  const handleUpdateAnnotation = (id: number) => {
    onAnnotationUpdate(id, commentText);
    setEditingAnnotation(null);
    setCommentText('');
  };

  const renderHighlightedText = () => {
    if (!content) return null;

    // Sort annotations by start index
    const sortedAnnotations = [...annotations].sort((a, b) => a.start_index - b.start_index);
    
    let parts = [];
    let lastIndex = 0;

    sortedAnnotations.forEach((annotation, index) => {
      // Add text before annotation
      if (annotation.start_index > lastIndex) {
        parts.push({
          type: 'text',
          content: content.slice(lastIndex, annotation.start_index),
          key: `text-${lastIndex}`,
        });
      }

      // Add highlighted annotation
      parts.push({
        type: 'annotation',
        content: content.slice(annotation.start_index, annotation.end_index),
        annotation: annotation,
        key: `annotation-${annotation.id}`,
      });

      lastIndex = annotation.end_index;
    });

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push({
        type: 'text',
        content: content.slice(lastIndex),
        key: `text-${lastIndex}`,
      });
    }

    return parts.map((part) => {
      if (part.type === 'text') {
        return <span key={part.key}>{part.content}</span>;
      } else {
        return (
          <span
            key={part.key}
            className="bg-yellow-200 border-b-2 border-yellow-400 cursor-pointer hover:bg-yellow-300 transition-colors"
            onClick={() => handleEditAnnotation(part.annotation)}
            title={`Comment: ${part.annotation.comment}`}
          >
            {part.content}
          </span>
        );
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Text content with highlighting */}
      <div 
        ref={textRef}
        className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap select-text cursor-text"
        onMouseUp={handleTextSelection}
      >
        {renderHighlightedText()}
      </div>

      {/* Annotations list */}
      {annotations.length > 0 && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Annotations ({annotations.length})
          </h3>
          <div className="space-y-3">
            {annotations.map((annotation) => (
              <div key={annotation.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-gray-600">
                    "{annotation.selected_text}"
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditAnnotation(annotation)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onAnnotationDelete(annotation.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {editingAnnotation === annotation.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      rows={2}
                      placeholder="Edit your comment..."
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleUpdateAnnotation(annotation.id)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingAnnotation(null)}
                        className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-700 text-sm">{annotation.comment}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comment dialog */}
      {showCommentDialog && selectedRange && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Add Annotation</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Selected text:</p>
              <p className="bg-yellow-100 p-2 rounded text-sm font-medium">
                "{selectedRange.text}"
              </p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comment:
              </label>
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md"
                rows={3}
                placeholder="Add your annotation comment..."
                autoFocus
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCommentDialog(false);
                  setSelectedRange(null);
                  setCommentText('');
                  window.getSelection()?.removeAllRanges();
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAnnotation}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                disabled={!commentText.trim()}
              >
                Add Annotation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">How to annotate:</h3>
        <ul className="text-blue-800 text-sm space-y-1">
          <li>• Select any text above to create a new annotation</li>
          <li>• Click on highlighted text to edit existing annotations</li>
          <li>• Your annotations will be saved automatically</li>
        </ul>
      </div>
    </div>
  );
};

export default TextAnnotator;