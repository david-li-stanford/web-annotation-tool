import React, { useState, useEffect } from 'react';

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

interface AdminDashboardProps {
  token: string;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ token, onLogout }) => {
  const [textExcerpts, setTextExcerpts] = useState<TextExcerpt[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [editingText, setEditingText] = useState<TextExcerpt | null>(null);
  const [formData, setFormData] = useState({ title: '', content: '' });
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [selectedTextForAnnotations, setSelectedTextForAnnotations] = useState<number | null>(null);
  const [annotations, setAnnotations] = useState<Record<number, Annotation[]>>({});
  const [loadingAnnotations, setLoadingAnnotations] = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetchTextExcerpts();
  }, []);

  const fetchTextExcerpts = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/texts');
      if (response.ok) {
        const data = await response.json();
        setTextExcerpts(data);
      }
    } catch (error) {
      console.error('Error fetching text excerpts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateText = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/api/texts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newText = await response.json();
        setTextExcerpts(prev => [newText, ...prev]);
        setFormData({ title: '', content: '' });
        setShowUploadForm(false);
      }
    } catch (error) {
      console.error('Error creating text excerpt:', error);
    }
  };

  const handleUpdateText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingText) return;

    try {
      const response = await fetch(`http://localhost:3001/api/texts/${editingText.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedText = await response.json();
        setTextExcerpts(prev => prev.map(text => 
          text.id === editingText.id ? updatedText : text
        ));
        setEditingText(null);
        setFormData({ title: '', content: '' });
      }
    } catch (error) {
      console.error('Error updating text excerpt:', error);
    }
  };

  const handleDeleteText = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:3001/api/texts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setTextExcerpts(prev => prev.filter(text => text.id !== id));
        setDeleteConfirm(null);
      }
    } catch (error) {
      console.error('Error deleting text excerpt:', error);
    }
  };

  const confirmDelete = (id: number) => {
    setDeleteConfirm(id);
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  const fetchAnnotations = async (textId: number) => {
    if (annotations[textId]) {
      // Already have annotations for this text
      return;
    }

    setLoadingAnnotations(prev => ({ ...prev, [textId]: true }));
    try {
      const response = await fetch(`http://localhost:3001/api/annotations/text/${textId}`);
      if (response.ok) {
        const data = await response.json();
        setAnnotations(prev => ({ ...prev, [textId]: data }));
      }
    } catch (error) {
      console.error('Error fetching annotations:', error);
    } finally {
      setLoadingAnnotations(prev => ({ ...prev, [textId]: false }));
    }
  };

  const toggleAnnotationsView = (textId: number) => {
    if (selectedTextForAnnotations === textId) {
      setSelectedTextForAnnotations(null);
    } else {
      setSelectedTextForAnnotations(textId);
      fetchAnnotations(textId);
    }
  };

  const deleteAnnotation = async (annotationId: number, textId: number) => {
    try {
      const response = await fetch(`http://localhost:3001/api/annotations/${annotationId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setAnnotations(prev => ({
          ...prev,
          [textId]: prev[textId]?.filter(ann => ann.id !== annotationId) || []
        }));
      }
    } catch (error) {
      console.error('Error deleting annotation:', error);
    }
  };

  const startEdit = (text: TextExcerpt) => {
    setEditingText(text);
    setFormData({ title: text.title, content: text.content });
  };

  const cancelEdit = () => {
    setEditingText(null);
    setFormData({ title: '', content: '' });
    setShowUploadForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <nav className="text-sm text-gray-500 mb-2">
                <span>Admin</span> / <span className="text-gray-900">Dashboard</span>
              </nav>
              <h1 className="text-2xl font-bold text-gray-900">Text Annotation Management</h1>
            </div>
            <div className="flex items-center space-x-4">
              <a 
                href="/" 
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                ← Back to App
              </a>
              <button
                onClick={onLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Action buttons */}
          <div className="mb-6 flex gap-4">
            <button
              onClick={() => setShowUploadForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Upload New Text
            </button>
          </div>

          {/* Upload/Edit Form */}
          {(showUploadForm || editingText) && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">
                {editingText ? 'Edit Text Excerpt' : 'Upload New Text Excerpt'}
              </h3>
              <form onSubmit={editingText ? handleUpdateText : handleCreateText}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-md"
                    placeholder="Enter title for the text excerpt"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-md"
                    rows={8}
                    placeholder="Paste or type the text content here"
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md"
                  >
                    {editingText ? 'Update Text' : 'Save Text'}
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-md"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Text Excerpts List */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Text Excerpts ({textExcerpts.length})
              </h3>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading...</span>
              </div>
            ) : textExcerpts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 mb-4">📝</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No text excerpts yet
                </h3>
                <p className="text-gray-600">
                  Upload your first text excerpt to get started.
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {textExcerpts.map((text) => (
                  <div key={text.id} className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="text-lg font-medium text-gray-900 mb-2">
                          {text.title}
                        </h4>
                        <p className="text-gray-600 text-sm mb-2 line-clamp-3">
                          {text.content.substring(0, 200)}
                          {text.content.length > 200 ? '...' : ''}
                        </p>
                        <p className="text-xs text-gray-500">
                          Created: {new Date(text.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => toggleAnnotationsView(text.id)}
                          className="text-green-600 hover:text-green-800 text-sm font-medium"
                        >
                          {selectedTextForAnnotations === text.id ? 'Hide' : 'View'} Annotations
                          {annotations[text.id] && ` (${annotations[text.id].length})`}
                        </button>
                        <button
                          onClick={() => startEdit(text)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => confirmDelete(text.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    
                    {/* Annotations section */}
                    {selectedTextForAnnotations === text.id && (
                      <div className="mt-4 border-t pt-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">
                          Annotations for "{text.title}"
                        </h4>
                        
                        {loadingAnnotations[text.id] ? (
                          <div className="flex items-center text-gray-500 text-sm">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                            Loading annotations...
                          </div>
                        ) : annotations[text.id]?.length === 0 ? (
                          <div className="text-gray-500 text-sm italic">
                            No annotations found for this text.
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {annotations[text.id]
                              ?.sort((a, b) => a.start_index - b.start_index)
                              .map((annotation, index) => (
                                <div 
                                  key={annotation.id}
                                  className="bg-yellow-50 border border-yellow-200 rounded-lg p-3"
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center space-x-2">
                                      <span className="bg-yellow-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                                        {index + 1}
                                      </span>
                                      <span className="text-xs text-gray-600">
                                        Position {annotation.start_index}-{annotation.end_index}
                                      </span>
                                    </div>
                                    <button
                                      onClick={() => deleteAnnotation(annotation.id, text.id)}
                                      className="text-red-500 hover:text-red-700 text-xs px-2 py-1 rounded hover:bg-red-50"
                                      title="Delete annotation"
                                    >
                                      🗑️
                                    </button>
                                  </div>
                                  
                                  <div className="mb-2">
                                    <div className="text-xs text-gray-600 mb-1">Selected text:</div>
                                    <div className="bg-yellow-100 px-2 py-1 rounded text-sm font-medium text-gray-800">
                                      "{annotation.selected_text}"
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <div className="text-xs text-gray-600 mb-1">Comment:</div>
                                    <div className="text-sm text-gray-700">
                                      {annotation.comment || <em className="text-gray-400">No comment</em>}
                                    </div>
                                  </div>
                                  
                                  <div className="text-xs text-gray-500 mt-2">
                                    Created: {new Date(annotation.created_at).toLocaleDateString()}
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this text excerpt? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteText(deleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;