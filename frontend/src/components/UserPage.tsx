import React, { useState, useEffect } from 'react';
import TextAnnotator from './TextAnnotator';

interface TextExcerpt {
  id: number;
  title: string;
  content: string;
  created_at: string;
}

interface Annotation {
  id: number;
  start_index: number;
  end_index: number;
  selected_text: string;
  comment: string;
  created_at: string;
}

const UserPage: React.FC = () => {
  const [textExcerpts, setTextExcerpts] = useState<TextExcerpt[]>([]);
  const [selectedText, setSelectedText] = useState<TextExcerpt | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [annotationsLoading, setAnnotationsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTextExcerpts();
  }, []);

  const fetchTextExcerpts = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/texts');
      if (response.ok) {
        const data = await response.json();
        setTextExcerpts(data);
      } else {
        setError('Failed to fetch text excerpts');
      }
    } catch (err) {
      setError('Connection error. Please check if the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleTextSelect = async (text: TextExcerpt) => {
    setSelectedText(text);
    await fetchAnnotations(text.id);
  };

  const handleBackToList = () => {
    setSelectedText(null);
    setAnnotations([]);
  };

  const fetchAnnotations = async (textId: number) => {
    setAnnotationsLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/annotations/text/${textId}`);
      if (response.ok) {
        const data = await response.json();
        setAnnotations(data);
      } else {
        console.error('Failed to fetch annotations');
      }
    } catch (err) {
      console.error('Error fetching annotations:', err);
    } finally {
      setAnnotationsLoading(false);
    }
  };

  const handleAnnotationCreate = async (annotation: Omit<Annotation, 'id' | 'created_at'>) => {
    if (!selectedText) return;

    try {
      const response = await fetch('http://localhost:3001/api/annotations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text_excerpt_id: selectedText.id,
          ...annotation,
        }),
      });

      if (response.ok) {
        const newAnnotation = await response.json();
        setAnnotations(prev => [...prev, newAnnotation]);
      } else {
        console.error('Failed to create annotation');
      }
    } catch (err) {
      console.error('Error creating annotation:', err);
    }
  };

  const handleAnnotationUpdate = async (id: number, comment: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/annotations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment }),
      });

      if (response.ok) {
        const updatedAnnotation = await response.json();
        setAnnotations(prev => prev.map(ann => ann.id === id ? updatedAnnotation : ann));
      } else {
        console.error('Failed to update annotation');
      }
    } catch (err) {
      console.error('Error updating annotation:', err);
    }
  };

  const handleAnnotationDelete = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:3001/api/annotations/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setAnnotations(prev => prev.filter(ann => ann.id !== id));
      } else {
        console.error('Failed to delete annotation');
      }
    } catch (err) {
      console.error('Error deleting annotation:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading text excerpts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">⚠️ {error}</div>
          <button
            onClick={fetchTextExcerpts}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (selectedText) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <button
                  onClick={handleBackToList}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  ← Back to Text List
                </button>
                <h1 className="text-2xl font-bold text-gray-900 mt-2">
                  {selectedText.title}
                </h1>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="max-w-7xl mx-auto h-full">
            {annotationsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading annotations...</span>
              </div>
            ) : (
              <div className="h-full">
                <TextAnnotator
                  textId={selectedText.id}
                  content={selectedText.content}
                  annotations={annotations}
                  onAnnotationCreate={handleAnnotationCreate}
                  onAnnotationUpdate={handleAnnotationUpdate}
                  onAnnotationDelete={handleAnnotationDelete}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">Text Annotation Tool</h1>
            <p className="mt-2 text-gray-600">
              Select a text excerpt below to start annotating
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {textExcerpts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No text excerpts available
            </h3>
            <p className="text-gray-600">
              Ask an admin to upload some text excerpts to get started with annotation.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {textExcerpts.map((text) => (
              <div
                key={text.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleTextSelect(text)}
              >
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {text.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {text.content.substring(0, 150)}
                    {text.content.length > 150 ? '...' : ''}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {new Date(text.created_at).toLocaleDateString()}
                    </span>
                    <span className="text-blue-600 font-medium text-sm">
                      Start Annotating →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserPage;