import React, { useMemo } from 'react';
import { Content, CyberTrainingAnalyticsRecord, Profile } from '../../../types';
import Modal from '../../../components/common/Modal';
import DataTable from '../../../components/common/DataTable';

interface InsightModalProps {
    isOpen: boolean;
    onClose: () => void;
    modalType: string | null;
    data: {
        xapiStatements: any[];
        profiles: Profile[];
        content: Content[];
        cyberAnalytics: CyberTrainingAnalyticsRecord[];
        behavioralData: {
            departmentalScores: { id: string; name: string; score: number }[];
        };
        complianceData: {
            controlCoverage: { id: string; control: string; rate: number }[];
        };
    };
}

const InsightModal: React.FC<InsightModalProps> = ({ isOpen, onClose, modalType, data }) => {
    
    const content = useMemo(() => {
        if (!isOpen) return null;

        const topMissedConcepts = () => {
            const incorrectAnswers = data.xapiStatements.filter(s => s.verb.id.includes('answered') && s.result?.success === false);
            const conceptMap: { [key: string]: number } = {};
            incorrectAnswers.forEach(s => {
                const concept = s.object.definition?.name?.['en-US'] || 'Unknown Concept';
                conceptMap[concept] = (conceptMap[concept] || 0) + 1;
            });
            return Object.entries(conceptMap).map(([concept, count]) => ({ id: concept, concept, count })).sort((a,b) => b.count - a.count);
        };

        switch (modalType) {
            case 'Learning Effectiveness':
                return (
                    <div>
                        <h4 className="font-bold text-lg mb-4">Top Missed Concepts</h4>
                        <p className="text-sm text-text-secondary mb-4">Based on incorrect quiz answers from xAPI data.</p>
                        <DataTable 
                            columns={[
                                { key: 'concept', header: 'Quiz Question / Concept' },
                                { key: 'count', header: 'Incorrect Answers' }
                            ]}
                            data={topMissedConcepts()}
                        />
                    </div>
                );
            case 'Behavioral Intelligence':
                return (
                    <div>
                        <h4 className="font-bold text-lg mb-4">Departmental Score Breakdown</h4>
                         <DataTable 
                            columns={[
                                { key: 'name', header: 'Department' },
                                { key: 'score', header: 'Average Score (%)' }
                            ]}
                            data={data.behavioralData.departmentalScores}
                        />
                    </div>
                );
             case 'Governance & Compliance':
                return (
                    <div>
                        <h4 className="font-bold text-lg mb-4">Compliance Training Status</h4>
                         <DataTable 
                            columns={[
                                { key: 'control', header: 'Compliance Control' },
                                { key: 'rate', header: 'Completion Rate (%)', render: (item) => item.rate.toFixed(1) + '%' }
                            ]}
                            data={data.complianceData.controlCoverage}
                        />
                    </div>
                );
            default:
                return <p>Detailed insight for this section is not yet available.</p>;
        }
    }, [isOpen, modalType, data]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Detailed Insight: ${modalType}`} size="xl">
            {content}
        </Modal>
    );
};

export default InsightModal;
