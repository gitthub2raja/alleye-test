import React, { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Profile as User } from '../../../types';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';

interface AskQuestionModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentUser: User;
}

const AskQuestionModal: React.FC<AskQuestionModalProps> = ({ isOpen, onClose, currentUser }) => {
    const [question, setQuestion] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!question.trim()) {
            alert("Please enter a question.");
            return;
        }
        setIsSubmitting(true);
        const { error } = await supabase
            .from('qanda')
            .insert({
                user_id: currentUser.id,
                question: question,
            });
        
        setIsSubmitting(false);

        if (error) {
            alert(`Error submitting question: ${error.message}`);
        } else {
            alert("Your question has been submitted and will be reviewed by an admin.");
            setQuestion('');
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Ask a Question">
            <form onSubmit={handleSubmit} className="space-y-4">
                <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Type your security-related question here..."
                    className="form-input"
                    rows={5}
                    required
                    disabled={isSubmitting}
                />
                <div className="flex justify-end">
                    <Button type="submit" variant="primary" disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting...' : 'Submit Question'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default AskQuestionModal;
