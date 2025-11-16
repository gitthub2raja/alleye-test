import React, { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Content, ContentType, Organization, Profile as User, QuizQuestion } from '../../../types';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';

interface ContentFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    content: Content | null;
    currentUser: User;
    allOrganizations: Organization[];
}

const ContentFormModal: React.FC<ContentFormModalProps> = ({ isOpen, onClose, content, currentUser, allOrganizations }) => {
    const [formData, setFormData] = useState<Partial<Content>>({
        title: '',
        description: '',
        type: ContentType.VIDEO,
        content_url: '',
        embed_url: '',
        html_content: '',
        questions: [],
        quiz_data: '',
        tags: [],
        visibility: 'org-wide',
        duration_sec: 0,
        risk_tags: [],
        compliance: [],
        thumbnail_url: '',
        category: '',
        difficulty: 'Intro',
        passing_score: 70,
        assigned_org_ids: [],
        ...content,
    });
    
    const [newQuestion, setNewQuestion] = useState({ question: '', options: ['', '', '', ''], correctAnswer: 0 });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const processedValue = name === 'duration_sec' || name === 'passing_score' ? parseInt(value, 10) : value;
        setFormData(prev => ({ ...prev, [name]: processedValue }));
    };

    const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'tags' | 'risk_tags' | 'compliance') => {
        setFormData(prev => ({ ...prev, [field]: e.target.value.split(',').map(tag => tag.trim()) }));
    };
    
    const handleOrgAssignmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
        setFormData(prev => ({ ...prev, assigned_org_ids: selectedOptions.includes('all') ? [] : selectedOptions }));
    };

    const handleQuestionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNewQuestion(prev => ({ ...prev, [name]: value }));
    };
    
    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...newQuestion.options];
        newOptions[index] = value;
        setNewQuestion(prev => ({ ...prev, options: newOptions }));
    };

    const addQuestion = () => {
        if (newQuestion.question && newQuestion.options.every(opt => opt)) {
            const questionToAdd = { ...newQuestion, id: Date.now() };
            setFormData(prev => ({ ...prev, questions: [...(prev.questions || []), questionToAdd] }));
            setNewQuestion({ question: '', options: ['', '', '', ''], correctAnswer: 0 });
        } else {
            alert('Please fill out the question and all four options.');
        }
    };
    
    const removeQuestion = (id: number) => {
        setFormData(prev => ({ ...prev, questions: prev.questions?.filter(q => q.id !== id) }));
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const finalData = { 
            ...formData, 
            creator_id: currentUser.id,
            quiz_data: (formData.type === ContentType.CYBER_SECURITY_TRAINING && (formData.questions?.length ?? 0) > 0)
                ? JSON.stringify(formData.questions)
                : formData.quiz_data,
        };
        
        let error;
        if (content?.id) {
            const { error: updateError } = await supabase.from('content').update(finalData).eq('id', content.id);
            error = updateError;
        } else {
            const { error: insertError } = await supabase.from('content').insert(finalData);
            error = insertError;
        }

        if (error) {
            alert(`Error saving content: ${error.message}`);
        } else {
            onClose();
        }
        setIsSubmitting(false);
    };

    const quizContentSelected = formData.type === ContentType.VIDEO_QUIZ || formData.type === ContentType.QUIZ || formData.type === ContentType.CYBER_SECURITY_TRAINING;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={content ? 'Edit Content' : 'Add New Content'} size="2xl">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label>Title</label>
                        <input name="title" value={formData.title} onChange={handleChange} className="form-input" required />
                    </div>
                    <div>
                        <label>Content Type</label>
                        <select name="type" value={formData.type} onChange={handleChange} className="form-select" required>
                            {Object.values(ContentType).map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                    </div>
                </div>
                <div>
                    <label>Description</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} className="form-input" />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label>Category</label>
                        <input name="category" value={formData.category} onChange={handleChange} className="form-input" placeholder="e.g., Phishing, Compliance" />
                    </div>
                    <div>
                        <label>Difficulty</label>
                         <select name="difficulty" value={formData.difficulty} onChange={handleChange} className="form-select">
                            <option value="Intro">Intro</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                        </select>
                    </div>
                </div>
                {formData.type === ContentType.HTML && (
                    <div>
                        <label>HTML Content</label>
                        <textarea name="html_content" value={formData.html_content} onChange={handleChange} className="form-input font-mono" rows={10}/>
                    </div>
                )}
                {formData.type === ContentType.CYBER_SECURITY_TRAINING && (
                    <div>
                        <label>Video URL (e.g., Supabase Storage)</label>
                        <input name="content_url" value={formData.content_url} onChange={handleChange} className="form-input" placeholder="https://..." />
                    </div>
                )}
                {([ContentType.VIDEO, ContentType.VIDEO_QUIZ].includes(formData.type!) || [ContentType.PDF, ContentType.SCORM, ContentType.HTML5, ContentType.REACT_SANDBOX].includes(formData.type!)) && (
                    <div>
                        <label>{[ContentType.PDF, ContentType.SCORM, ContentType.HTML5, ContentType.REACT_SANDBOX].includes(formData.type!) ? 'Embed URL' : 'Content URL'}</label>
                        <input name={ [ContentType.PDF, ContentType.SCORM, ContentType.HTML5, ContentType.REACT_SANDBOX].includes(formData.type!) ? 'embed_url' : 'content_url'} value={formData.embed_url || formData.content_url} onChange={handleChange} className="form-input" />
                    </div>
                )}
                {quizContentSelected && (
                    <div className="p-4 border border-border rounded-lg space-y-4">
                        <h3 className="font-semibold text-lg">Quiz Questions</h3>
                        <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                             {formData.questions?.map((q, index) => (
                                <div key={q.id} className="bg-sidebar-accent p-2 rounded-md">
                                    <p className="text-sm font-semibold flex justify-between">
                                        <span>{index+1}. {q.question}</span>
                                        <button type="button" onClick={() => removeQuestion(q.id)} className="text-red-500 hover:text-red-400">&times;</button>
                                    </p>
                                    <ul className="text-xs list-disc pl-5">
                                        {q.options.map((opt, i) => <li key={i} className={i === q.correctAnswer ? 'font-bold text-green-400' : ''}>{opt}</li>)}
                                    </ul>
                                </div>
                            ))}
                        </div>
                        <div className="space-y-2 pt-4 border-t border-border">
                             <h4 className="font-semibold">Add New Question</h4>
                            <textarea name="question" value={newQuestion.question} onChange={handleQuestionChange} placeholder="Question text (can be HTML)" className="form-input" />
                            {newQuestion.options.map((opt, i) => (
                                <input key={i} value={opt} onChange={e => handleOptionChange(i, e.target.value)} placeholder={`Option ${i+1}`} className="form-input" />
                            ))}
                             <select name="correctAnswer" value={newQuestion.correctAnswer} onChange={e => setNewQuestion(p => ({...p, correctAnswer: parseInt(e.target.value)}))} className="form-select">
                                {newQuestion.options.map((_, i) => <option key={i} value={i}>Option {i+1} is correct</option>)}
                            </select>
                            <Button type="button" variant="secondary" onClick={addQuestion}>Add Question</Button>
                        </div>
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label>Tags (comma-separated)</label>
                        <input name="tags" value={formData.tags?.join(', ')} onChange={(e) => handleTagChange(e, 'tags')} className="form-input" />
                    </div>
                     <div>
                        <label>Thumbnail URL</label>
                        <input name="thumbnail_url" value={formData.thumbnail_url} onChange={handleChange} className="form-input" />
                    </div>
                    <div>
                        <label>Duration (seconds)</label>
                        <input type="number" name="duration_sec" value={formData.duration_sec} onChange={handleChange} className="form-input" />
                    </div>
                    {quizContentSelected && (
                        <div>
                            <label>Passing Score (%)</label>
                            <input type="number" name="passing_score" value={formData.passing_score} onChange={handleChange} className="form-input" />
                        </div>
                    )}
                </div>
                 <div>
                    <label>Assign to Organizations</label>
                    <select
                        multiple
                        name="assigned_org_ids"
                        value={formData.assigned_org_ids?.length === 0 ? ['all'] : formData.assigned_org_ids}
                        onChange={handleOrgAssignmentChange}
                        className="form-select h-32"
                    >
                        <option value="all">All Organizations</option>
                        {allOrganizations.map(org => (
                            <option key={org.id} value={org.id}>{org.name}</option>
                        ))}
                    </select>
                    <p className="text-xs text-text-secondary mt-1">Hold Ctrl/Cmd to select multiple. Selecting 'All Organizations' will override other selections.</p>
                </div>
                <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Content'}</Button>
                </div>
            </form>
        </Modal>
    );
};

export default ContentFormModal;
