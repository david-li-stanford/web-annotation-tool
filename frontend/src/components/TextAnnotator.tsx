import React, { useState, useRef, useCallback } from 'react';

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

    const selectedText = selection.toString().trim();
    
    if (selectedText.length === 0) return;

    // Calculate character indices in the original text
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

  const handleAnnotationClick = (annotation: Annotation) => {
    // Scroll the annotation into view if possible
    const textElement = textRef.current;
    if (!textElement) return;

    // Find the highlighted span for this annotation
    const spans = textElement.querySelectorAll('span[data-annotation-id]');
    const targetSpan = Array.from(spans).find(span => 
      span.getAttribute('data-annotation-id') === annotation.id.toString()
    );

    if (targetSpan) {
      targetSpan.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Add a temporary highlight effect
      targetSpan.classList.add('animate-pulse');
      setTimeout(() => {
        targetSpan.classList.remove('animate-pulse');
      }, 2000);
    }
  };

  const renderHighlightedText = () => {
    if (!content) return null;

    // Sort annotations by start index
    const sortedAnnotations = [...annotations].sort((a, b) => a.start_index - b.start_index);
    
    type TextPart = {
      type: 'text';
      content: string;
      key: string;
    };

    type AnnotationPart = {
      type: 'annotation';
      content: string;
      annotation: Annotation;
      key: string;
    };

    let parts: (TextPart | AnnotationPart)[] = [];
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
      } else if (part.type === 'annotation') {
        return (
          <span
            key={part.key}
            data-annotation-id={part.annotation.id}
            className="bg-yellow-200 border-b-2 border-yellow-400 cursor-pointer hover:bg-yellow-300 transition-colors"
            onClick={() => handleEditAnnotation(part.annotation)}
            title={`Comment: ${part.annotation.comment}`}
          >
            {part.content}
          </span>
        );
      }
      return null;
    });
  };

  return (
    <div className="flex gap-6 h-full">
      {/* Main text content - Left side */}
      <div className="flex-1 min-w-0">
        <div 
          ref={textRef}
          className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap select-text cursor-text bg-white p-6 rounded-lg shadow-sm border"
          onMouseUp={handleTextSelection}
        >
          {renderHighlightedText()}
        </div>
        
        {/* Instructions below text */}
        <div className="mt-4 bg-blue-50 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">How to annotate:</h3>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>• Select any text to create a new annotation</li>
            <li>• Click on highlighted text to edit existing annotations</li>
            <li>• Your annotations appear in the sidebar on the right</li>
          </ul>
        </div>
      </div>

      {/* Annotations sidebar - Right side */}
      <div className="w-80 flex-shrink-0">
        <div className="bg-white rounded-lg shadow-sm border h-full flex flex-col">
          {/* Sidebar header */}
          <div className="px-4 py-3 border-b bg-gray-50 rounded-t-lg">
            <h3 className="text-lg font-semibold text-gray-900">
              Annotations ({annotations.length})
            </h3>
          </div>
          
          {/* Annotations list with scroll */}
          <div className="flex-1 overflow-y-auto p-4">
            {annotations.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <div className="text-4xl mb-2">📝</div>
                <p className="text-sm">No annotations yet</p>
                <p className="text-xs mt-1">Select text to create your first annotation</p>
              </div>
            ) : (
              <div className="space-y-4">
                {annotations
                  .sort((a, b) => a.start_index - b.start_index)
                  .map((annotation, index) => (
                    <div 
                      key={annotation.id} 
                      className="bg-gray-50 rounded-lg p-3 border-l-4 border-yellow-400 hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => handleAnnotationClick(annotation)}
                      title="Click to highlight this annotation in the text"
                    >
                      {/* Annotation number and selected text */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="bg-yellow-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                            {index + 1}
                          </span>
                          <span className="text-xs text-gray-500">
                            Position {annotation.start_index}
                          </span>
                        </div>
                        <div className="flex space-x-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleEditAnnotation(annotation)}
                            className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 rounded hover:bg-blue-50"
                            title="Edit annotation"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => onAnnotationDelete(annotation.id)}
                            className="text-red-600 hover:text-red-800 text-xs px-2 py-1 rounded hover:bg-red-50"
                            title="Delete annotation"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      
                      {/* Selected text preview */}
                      <div className="mb-2">
                        <div className="text-xs text-gray-600 mb-1">Selected text:</div>
                        <div className="bg-yellow-100 px-2 py-1 rounded text-sm font-medium text-gray-800 border">
                          "{annotation.selected_text.length > 50 
                            ? annotation.selected_text.substring(0, 50) + '...' 
                            : annotation.selected_text}"
                        </div>
                      </div>
                      
                      {/* Comment section */}
                      <div>
                        <div className="text-xs text-gray-600 mb-1">Comment:</div>
                        {editingAnnotation === annotation.id ? (
                          <div className="space-y-2">
                            <textarea
                              value={commentText}
                              onChange={(e) => setCommentText(e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded-md text-sm resize-none"
                              rows={3}
                              placeholder="Edit your comment..."
                              autoFocus
                            />
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleUpdateAnnotation(annotation.id)}
                                className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingAnnotation(null)}
                                className="px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-gray-700 text-sm bg-white p-2 rounded border">
                            {annotation.comment || <em className="text-gray-400">No comment</em>}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

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
    </div>
  );
};

export default TextAnnotator;