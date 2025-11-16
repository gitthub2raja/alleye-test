import React, { useState } from 'react';
import { QAndAItem } from '../../../types';
import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import FaqContent from '../../../components/common/FaqContent';

interface QAViewProps {
    userQanda: QAndAItem[];
    faqItems: QAndAItem[];
    onAsk: () => void;
}

const QAView: React.FC<QAViewProps> = ({ userQanda, faqItems, onAsk }) => {
    const [activeTab, setActiveTab] = useState('faq');

    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Q&A and FAQ</h1>
                <Button onClick={onAsk}>Ask a Question</Button>
            </div>

            <div className="flex border-b border-border mb-6">
                <button onClick={() => setActiveTab('faq')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'faq' ? 'border-b-2 border-primary text-primary' : 'text-text-secondary'}`}>Platform FAQs</button>
                <button onClick={() => setActiveTab('company')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'company' ? 'border-b-2 border-primary text-primary' : 'text-text-secondary'}`}>Company FAQs</button>
                <button onClick={() => setActiveTab('my')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'my' ? 'border-b-2 border-primary text-primary' : 'text-text-secondary'}`}>My Questions</button>
            </div>
            
            {activeTab === 'faq' && <Card><div className="max-h-[60vh] overflow-y-auto"><FaqContent /></div></Card>}
            
            {activeTab === 'company' && (
                <Card>
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                        {faqItems.map(item => (
                            <div key={item.id} className="p-3 border-b border-border last:border-b-0">
                                <p className="font-semibold text-text-main">{item.question}</p>
                                <p className="text-sm text-text-secondary mt-1">{item.answer}</p>
                            </div>
                        ))}
                        {faqItems.length === 0 && <p className="text-text-secondary">No company-specific FAQs available.</p>}
                    </div>
                </Card>
            )}

            {activeTab === 'my' && (
                <Card>
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                        {userQanda.map(item => (
                            <div key={item.id} className="p-4 bg-sidebar-accent rounded-lg">
                                <p className="font-semibold text-text-main">{item.question}</p>
                                {item.answer ? (
                                    <p className="text-sm mt-2 p-2 bg-background rounded-md border border-border"><strong>Answer:</strong> {item.answer}</p>
                                ) : (
                                    <p className="text-sm mt-2 text-yellow-400 italic">Awaiting answer from an admin.</p>
                                )}
                            </div>
                        ))}
                         {userQanda.length === 0 && <p className="text-text-secondary">You haven't asked any questions yet.</p>}
                    </div>
                </Card>
            )}

        </div>
    );
};

export default QAView;
