import React, { useMemo } from 'react';
import { Profile as User, Content, ContentType } from '../../../types';
import Card from '../../../components/common/Card';

const CourseConquerorBadge = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 2L9 9l-7 1 5 5-2 7 7-4 7 4-2-7 5-5-7-1z"></path></svg>);

interface ActivityViewProps {
    user: User;
    allContent: Content[];
}

const ActivityView: React.FC<ActivityViewProps> = ({ user, allContent }) => {
    const badges = [
        { id: 'Course Conqueror', name: 'Course Conqueror', description: 'Complete 5 courses', icon: <CourseConquerorBadge className="w-16 h-16 text-yellow-400" /> },
    ];
    const earnedBadges = badges.filter(b => user.badges?.includes(b.id));

    const quizResults = useMemo(() => {
        if (!user.progress || !allContent) {
            return [];
        }
        const quizContentTypes = [ContentType.QUIZ, ContentType.VIDEO_QUIZ, ContentType.CYBER_SECURITY_TRAINING];
        
        return allContent
            .filter(c => quizContentTypes.includes(c.type))
            .map(c => {
                const progress = user.progress![c.id];
                if (progress?.status === 'completed' && progress.score !== undefined) {
                    return {
                        id: c.id,
                        title: c.title,
                        score: progress.score!,
                        passing_score: c.passing_score ?? 70,
                    };
                }
                return null;
            })
            .filter((r): r is {id: number, title: string, score: number, passing_score: number} => r !== null)
            .sort((a, b) => b.id - a.id);
    }, [user, allContent]);


    return (
        <div className="animate-fade-in">
            <h1 className="text-3xl font-bold mb-6">My Activity</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1">
                    <h2 className="text-xl font-bold mb-4">Stats</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-sidebar-accent rounded-lg">
                            <span className="font-semibold text-text-main">Points Earned</span>
                            <span className="font-bold text-2xl text-highlight">{user.points || 0}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-sidebar-accent rounded-lg">
                            <span className="font-semibold text-text-main">Courses Completed</span>
                            <span className="font-bold text-2xl text-highlight">{Object.values(user.progress || {}).filter(p => p.status === 'completed').length}</span>
                        </div>
                    </div>
                </Card>
                 <Card className="lg:col-span-2">
                    <h2 className="text-xl font-bold mb-4">Badges</h2>
                    <div className="flex flex-wrap gap-6">
                        {earnedBadges.length > 0 ? (
                           earnedBadges.map(badge => (
                               <div key={badge.id} className="text-center">
                                   {badge.icon}
                                   <p className="font-semibold mt-2">{badge.name}</p>
                                   <p className="text-xs text-text-secondary">{badge.description}</p>
                               </div>
                           ))
                        ) : (
                           <p className="text-text-secondary">No badges earned yet. Keep learning to unlock them!</p> 
                        )}
                    </div>
                 </Card>
            </div>

            {quizResults.length > 0 && (
                <Card className="mt-6">
                    <h2 className="text-xl font-bold mb-6">My Quiz Performance</h2>
                    <div className="max-h-[25rem] overflow-y-auto space-y-6 pr-4 custom-scrollbar">
                        {quizResults.map(result => {
                            const passed = result.score >= result.passing_score;
                            return (
                                <div key={result.id}>
                                    <div className="grid grid-cols-12 gap-4 items-center mb-2">
                                        <p className="font-semibold text-text-main text-sm col-span-12 sm:col-span-7">{result.title}</p>
                                        <div className="col-span-12 sm:col-span-5 flex items-center justify-between sm:justify-end gap-3 flex-shrink-0">
                                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${passed ? 'bg-green-600/30 text-green-300' : 'bg-red-600/30 text-red-300'}`}>
                                                {passed ? 'Passed' : 'Failed'}
                                            </span>
                                            <span className="font-semibold text-text-main w-10 text-right">{result.score}%</span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-500/30 rounded-full h-2.5">
                                        <div 
                                            className="h-2.5 rounded-full" 
                                            style={{ 
                                                width: `${result.score}%`,
                                                backgroundColor: passed ? '#16a34a' : '#f59e0b'
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            )}
        </div>
    );
};

export default ActivityView;