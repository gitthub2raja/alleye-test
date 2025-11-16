import React, { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { QAndAItem, Profile as User } from '../../../types';
import ViewHeader from '../components/ViewHeader';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Modal from '../../../components/common/Modal';

interface QAManagementViewProps {
    qandaItems: QAndAItem[];
    currentUser: User;
}

const QAManagementView: React.FC<QAManagementViewProps> = ({ qandaItems, currentUser }) => {
    const [answeringItem, setAnsweringItem] = useState<QAndAItem | null>(null);

    const handleAnswerSubmit = async (answer: string) => {
        if (!answeringItem) return;
        const { error } = await supabase.from('qanda').update({ 
            answer, 
            answered_by: currentUser.id,
            answered_at: new Date().toISOString()
        }).eq('id', answeringItem.id);

        if (error) {
            alert("Error submitting answer: " + error.message);
        } else {
            setAnsweringItem(null);
        }
    };
    
    const handleFaqToggle = async (item: QAndAItem) => {
        const { error } = await supabase.from('qanda').update({ is_faq: !item.is_faq }).eq('id', item.id);
        if (error) alert("Error toggling FAQ: " + error.message);
    };

    const pending = qandaItems.filter(i => !i.answer);
    const answered = qandaItems.filter(i => i.answer);

    return (
        <div className="animate-fade-in">
            <ViewHeader title="Q&A Management" subtitle="Respond to user questions and manage the FAQ."/>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <h2 className="text-xl font-bold mb-4">Pending Questions ({pending.length})</h2>
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                        {pending.map(item => (
                            <div key={item.id} className="p-3 bg-sidebar-accent rounded-lg">
                                <div className="flex items-start gap-3">
                                    <img src={item.user?.avatar_url || `https://i.pravatar.cc/150?u=${item.user_id}`} alt={item.user?.name} className="w-8 h-8 rounded-full"/>
                                    <div>
                                        <p className="font-semibold text-text-main">{item.question}</p>
                                        <p className="text-xs text-text-secondary">Asked by {item.user?.name || 'Unknown'} on {new Date(item.created_at).toLocaleDateString()}</p>
                                        <Button size="sm" variant="secondary" className="mt-2" onClick={() => setAnsweringItem(item)}>Answer</Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                         {pending.length === 0 && <p className="text-text-secondary">No pending questions.</p>}
                    </div>
                </Card>
                <Card>
                     <h2 className="text-xl font-bold mb-4">Answered Questions</h2>
                     <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                         {answered.map(item => (
                            <div key={item.id} className="p-3 bg-sidebar-accent rounded-lg">
                                <p className="font-semibold text-text-main">{item.question}</p>
                                <p className="text-sm my-2 p-2 bg-background rounded-md">{item.answer}</p>
                                <div className="flex justify-between items-center">
                                    <p className="text-xs text-text-secondary">Answered by {item.admin?.name || 'Admin'}</p>
                                    <label className="flex items-center cursor-pointer">
                                        <input type="checkbox" checked={item.is_faq} onChange={() => handleFaqToggle(item)} className="h-4 w-4 rounded" />
                                        <span className="ml-2 text-xs">Mark as FAQ</span>
                                    </label>
                                </div>
                            </div>
                        ))}
                        {answered.length === 0 && <p className="text-text-secondary">No questions have been answered yet.</p>}
                     </div>
                </Card>
            </div>
            {answeringItem && (
                <Modal isOpen={!!answeringItem} onClose={() => setAnsweringItem(null)} title="Answer Question">
                     <div>
                        <p className="mb-2 p-3 bg-sidebar-accent rounded-lg">{answeringItem.question}</p>
                        <form onSubmit={(e) => { e.preventDefault(); handleAnswerSubmit((e.currentTarget.elements.namedItem('answer') as HTMLTextAreaElement).value); }}>
                            <textarea name="answer" placeholder="Your answer..." className="form-input" rows={5} required />
                            <div className="flex justify-end pt-4"><Button type="submit">Submit Answer</Button></div>
                        </form>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default QAManagementView;
