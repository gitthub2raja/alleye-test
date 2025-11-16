import React, { useMemo } from 'react';
import { QAndAItem } from '../../../types';
import ViewHeader from '../components/ViewHeader';
import Card from '../../../components/common/Card';
import FaqContent from '../../../components/common/FaqContent';

interface QAViewProps {
    qandaItems: QAndAItem[];
}

const QAView: React.FC<QAViewProps> = ({ qandaItems }) => {
    const faqs = useMemo(() => qandaItems.filter(item => item.is_faq), [qandaItems]);
    return (
        <div className="animate-fade-in">
            <ViewHeader title="Q&A and FAQ" />
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <Card>
                        <h2 className="text-xl font-bold mb-4">Company Frequently Asked Questions</h2>
                        <div className="space-y-4 max-h-[500px] overflow-y-auto">
                            {faqs.map(item => (
                                <div key={item.id} className="p-3 border-b border-border last:border-b-0">
                                    <p className="font-semibold text-text-main">{item.question}</p>
                                    <p className="text-sm text-text-secondary mt-1">{item.answer}</p>
                                </div>
                            ))}
                            {faqs.length === 0 && <p className="text-text-secondary">No company-specific FAQs have been added yet.</p>}
                        </div>
                    </Card>
                </div>
                <div>
                     <Card>
                        <div className="max-h-[560px] overflow-y-auto">
                           <FaqContent />
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default QAView;
