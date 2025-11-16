import React, { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { NewsItem, NewsItemType, Profile as User } from '../../../types';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';

interface ThreatIntelFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    update: NewsItem | null;
    currentUser: User;
}

const ThreatIntelFormModal: React.FC<ThreatIntelFormModalProps> = ({ isOpen, onClose, update, currentUser }) => {
    const [formData, setFormData] = useState({
        title: update?.title || '',
        type: update?.type || NewsItemType.HTML_ARTICLE,
        content: update?.content || '',
        embed_url: update?.embed_url || '',
        thumbnail_url: update?.thumbnail_url || '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const finalData = { ...formData, author_id: currentUser.id };

        if (update?.id) {
            const { error } = await supabase.from('news').update(finalData).eq('id', update.id);
            if (error) { alert(`Error: ${error.message}`); } else { onClose(); }
        } else {
            const { error } = await supabase.from('news').insert(finalData);
            if (error) { alert(`Error: ${error.message}`); } else { onClose(); }
        }
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={update ? 'Edit News' : 'Create News'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input value={formData.title} onChange={e => setFormData(p => ({...p, title: e.target.value}))} placeholder="Title" className="form-input" required/>
                <select value={formData.type} onChange={e => setFormData(p => ({...p, type: e.target.value as NewsItemType}))} className="form-select">
                    {Object.values(NewsItemType).map(type => <option key={type} value={type}>{type}</option>)}
                </select>
                {formData.type === NewsItemType.HTML_ARTICLE && <textarea value={formData.content} onChange={e => setFormData(p => ({...p, content: e.target.value}))} placeholder="Article content (HTML allowed)" className="form-input" rows={10}/>}
                {formData.type === NewsItemType.REACT_SANDBOX && <input value={formData.embed_url} onChange={e => setFormData(p => ({...p, embed_url: e.target.value}))} placeholder="React Sandbox Embed URL" className="form-input" />}
                <input value={formData.thumbnail_url} onChange={e => setFormData(p => ({...p, thumbnail_url: e.target.value}))} placeholder="Thumbnail Image URL" className="form-input" />

                <div className="flex justify-end pt-4">
                    <Button type="submit">Save Post</Button>
                </div>
            </form>
        </Modal>
    );
};

export default ThreatIntelFormModal;
