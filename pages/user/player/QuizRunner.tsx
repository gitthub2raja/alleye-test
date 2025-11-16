import React, { useState, useEffect } from 'react';
import { QuizQuestion, Profile as User, Content } from '../../../types';
import { sendAnsweredStatement } from '../../../lib/xapi';
import Button from '../../../components/common/Button';

const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);

interface QuizRunnerProps {
    questions: QuizQuestion[];
    onComplete: (score: number) => void;
    user: User;
    content: Content;
}

const QuizRunner: React.FC<QuizRunnerProps> = ({ questions, onComplete, user, content }) => {
    const [current, setCurrent] = useState(0);
    const [answers, setAnswers] = useState<(number | null)[]>([]);
    const [finished, setFinished] = useState(false);
    const [score, setScore] = useState(0);

    useEffect(() => {
        setAnswers(new Array(questions.length).fill(null));
    }, [questions]);

    const handleAnswer = (optionIndex: number) => { 
        const newAnswers = [...answers]; 
        newAnswers[current] = optionIndex; 
        setAnswers(newAnswers); 
        const isCorrect = questions[current].correctAnswer === optionIndex;
        sendAnsweredStatement(user, content, questions[current], questions[current].options[optionIndex], isCorrect);
    };
    
    const handleNext = () => { if (current < questions.length - 1) setCurrent(p => p + 1); else handleSubmit(); };
    
    const handleSubmit = () => {
        let correct = 0;
        questions.forEach((q, i) => { if (q.correctAnswer === answers[i]) correct++; });
        const finalScore = Math.round((correct / questions.length) * 100);
        setScore(finalScore);
        setFinished(true);
        onComplete(finalScore);
    };

    if (finished) return <div className="text-center p-8 bg-sidebar flex flex-col items-center justify-center h-full"><CheckCircleIcon className="w-16 h-16 text-green-400 mb-4" /><h2 className="text-2xl font-bold">Quiz Complete!</h2><p className="text-5xl font-bold my-4 text-highlight">{score}%</p><p className="text-text-secondary">{score >= (content.passing_score ?? 70) ? "Congratulations, you passed!" : "You did not pass. Please review and try again."}</p></div>;
    if (!questions || questions.length === 0) return <div className="p-8 text-center"><p>No questions available.</p></div>
    
    const q = questions[current];

    return (
        <div className="p-6 sm:p-8 bg-sidebar h-full flex flex-col">
            <h3 className="text-lg font-semibold mb-2 text-text-main">Question {current + 1} of {questions.length}</h3>
            <div className="text-text-secondary mb-4 prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: q.question }}></div>
            <div className="space-y-3 my-4 flex-1 overflow-y-auto">
                {q.options.map((opt, i) => (
                    <label key={i} className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-colors ${answers[current] === i ? 'bg-primary/20 border-primary' : 'bg-background border-border hover:border-sidebar-accent'}`}>
                        <input type="radio" name={`q-${q.id}`} checked={answers[current] === i} onChange={() => handleAnswer(i)} className="w-5 h-5 accent-primary" />
                        <span className="ml-4 text-text-main">{opt}</span>
                    </label>
                ))}
            </div>
            <div className="pt-4 mt-auto">
                 <Button onClick={handleNext} className="w-full" variant="primary">{current === questions.length - 1 ? 'Submit' : 'Next Question'}</Button>
            </div>
        </div>
    );
};

export default QuizRunner;
