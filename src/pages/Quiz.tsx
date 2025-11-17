import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { mockVideos, mockQuizzes } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, Trophy, ArrowRight, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUserProgress } from "@/hooks/useUserProgress";

const Quiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { markCompleted } = useUserProgress();

  const video = mockVideos.find(v => v.id === id);
  const quiz = mockQuizzes.find(q => q.videoId === id);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [showResults, setShowResults] = useState(false);

  if (!video || !quiz) {
    return null;
  }

  const question = quiz.questions[currentQuestion];
  const totalQuestions = quiz.questions.length;
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  const handleNext = () => {
    if (selectedAnswer === null) {
      toast({
        title: "Please select an answer",
        variant: "destructive",
      });
      return;
    }

    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);

    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      // Calculate score and save to database
      const finalAnswers = [...answers, selectedAnswer];
      const score = calculateScoreFromAnswers(finalAnswers);
      
      if (id) {
        markCompleted.mutate({ videoId: id, quizScore: score });
      }
      
      setAnswers(finalAnswers);
      setShowResults(true);
    }
  };

  const calculateScoreFromAnswers = (finalAnswers: (number | null)[]) => {
    let correct = 0;
    finalAnswers.forEach((answer, index) => {
      if (answer === quiz.questions[index].correctAnswer) {
        correct++;
      }
    });
    return Math.round((correct / totalQuestions) * 100);
  };

  const calculateScore = () => {
    return calculateScoreFromAnswers(answers);
  };

  const score = showResults ? calculateScore() : 0;

  if (showResults) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="absolute top-4 left-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
        <Card className="w-full max-w-2xl border-primary/20 text-center">
          <CardHeader>
            <Trophy className="mx-auto mb-4 h-20 w-20 text-accent animate-glow-pulse" />
            <CardTitle className="text-3xl">Quiz Complete!</CardTitle>
            <CardDescription>Here's how you did on {video.title}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-8">
              <div className="mb-4 text-6xl font-bold text-primary">{score}%</div>
              <p className="text-lg text-muted-foreground">
                You answered {answers.filter((a, i) => a === quiz.questions[i].correctAnswer).length} out of {totalQuestions} questions correctly
              </p>
            </div>

            {/* Answer Review */}
            <div className="mb-8 space-y-4 text-left">
              {quiz.questions.map((q, index) => {
                const userAnswer = answers[index];
                const isCorrect = userAnswer === q.correctAnswer;
                
                return (
                  <div key={q.id} className="rounded-lg border p-4">
                    <div className="mb-2 flex items-start gap-2">
                      {isCorrect ? (
                        <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-accent" />
                      ) : (
                        <XCircle className="mt-1 h-5 w-5 shrink-0 text-destructive" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{q.question}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Your answer: {q.options[userAnswer!]}
                        </p>
                        {!isCorrect && (
                          <p className="mt-1 text-sm text-accent">
                            Correct answer: {q.options[q.correctAnswer]}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <Button size="lg" onClick={() => navigate("/dashboard")} className="cyber-glow">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="absolute top-4 left-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
      <Card className="w-full max-w-2xl border-primary/20">
        <CardHeader>
          <div className="mb-4 flex items-center justify-between">
            <CardDescription>
              Question {currentQuestion + 1} of {totalQuestions}
            </CardDescription>
            <CardDescription>{video.title}</CardDescription>
          </div>
          <Progress value={progress} className="mb-4 h-2" />
          <CardTitle className="text-2xl">{question.question}</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={selectedAnswer?.toString()}
            onValueChange={(value) => setSelectedAnswer(parseInt(value))}
            className="space-y-3"
          >
            {question.options.map((option, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 rounded-lg border p-4 transition-colors hover:border-primary"
              >
                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                <Label
                  htmlFor={`option-${index}`}
                  className="flex-1 cursor-pointer text-base"
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>

          <Button
            onClick={handleNext}
            className="mt-6 w-full cyber-glow"
            size="lg"
          >
            {currentQuestion < totalQuestions - 1 ? (
              <>
                Next Question
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            ) : (
              "Submit Quiz"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Quiz;
