import React from 'react';
import Card from './Card';

const FaqContent: React.FC = () => {
  return (
    <div className="prose prose-invert max-w-none">
      <h2 className="text-2xl font-bold">Kyureeus AllEye — User FAQs</h2>
      <p className="text-sm text-text-secondary">Security Awareness & Training</p>

      <h3 className="mt-6 text-lg font-semibold">1. What is AllEye?</h3>
      <p>AllEye is your organization’s security awareness and digital safety learning platform. It helps you build smart, practical habits to stay secure — at work, at home, and online.</p>

      <h3 className="mt-6 text-lg font-semibold">2. Why am I being asked to take this training?</h3>
      <p>Because cybersecurity is everyone’s job — not just the IT team’s. This training helps you understand real risks, avoid common mistakes, and protect both company and personal data from today’s evolving digital threats.</p>

      <h3 className="mt-6 text-lg font-semibold">3. What’s unique about AllEye training?</h3>
      <p>AllEye lessons aren’t just slides or checklists — they’re stories of real breaches from around the world. You’ll see how incidents happened, the small mistakes that led to them, and the smart actions that could have prevented them. Every story ends with what we can learn — not blame, but better instincts.</p>

      <h3 className="mt-6 text-lg font-semibold">4. What will I learn?</h3>
      <p>You’ll learn how to:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>Safeguard passwords, credentials, and personal data</li>
        <li>Handle confidential information responsibly</li>
        <li>Secure devices and remote connections</li>
        <li>Recognize social engineering and manipulation tactics</li>
        <li>Follow key security practices in daily work</li>
        <li>Respond the right way when something feels “off”</li>
      </ul>

      <h3 className="mt-6 text-lg font-semibold">5. How long does each training take?</h3>
      <p>Each video or lesson takes only 2-3 minutes. They’re short, easy to follow, and designed to fit naturally into your workday.</p>

      <h3 className="mt-6 text-lg font-semibold">6. How often will I get new lessons?</h3>
      <p>New topics are released monthly or quarterly — covering emerging threats, industry stories, and lessons learned from recent incidents.</p>

      <h3 className="mt-6 text-lg font-semibold">7. Do I need technical knowledge to understand the training?</h3>
      <p>Not at all. AllEye is made for everyone — whether you work in HR, sales, engineering, or finance. The lessons use plain language, visuals, and examples to make complex ideas simple.</p>

      <h3 className="mt-6 text-lg font-semibold">8. Can I watch the videos later or on mobile?</h3>
      <p>Yes! You can access AllEye anytime from your phone, tablet, or computer. Your progress is automatically saved — so you can start, pause, and continue whenever you like.</p>

      <h3 className="mt-6 text-lg font-semibold">9. How is my progress tracked?</h3>
      <p>You’ll see a personal Learning Dashboard showing which modules you’ve completed, what’s next, and how your Security Awareness Score is improving. It’s private to you and designed to help you keep building confidence over time.</p>

      <h3 className="mt-6 text-lg font-semibold">10. Will my manager see my individual results?</h3>
      <p>Managers usually see team-level completion rates, and if required individual scores. AllEye’s goal is culture change, not punishment — it’s about growth, not grades.</p>

      <h3 className="mt-6 text-lg font-semibold">11. Can I revisit old videos or topics?</h3>
      <p>Yes — your past lessons stay unlocked in your dashboard. You can rewatch any module, especially if you want a quick refresher before an audit, certification, or presentation.</p>

      <h3 className="mt-6 text-lg font-semibold">12. How does this training help me personally?</h3>
      <p>Everything you learn here applies to your personal life too. You’ll discover how to protect your online accounts, recognize scams, and secure your digital footprint — skills that protect your family, not just your company.</p>

      <h3 className="mt-6 text-lg font-semibold">13. Will I get certificates or recognition?</h3>
      <p>Yes. You’ll earn Kyureeus Digital Safety Certificates and Awareness Badges as you progress through levels. High performers may also be recognized as Security Champions in your organization.</p>
      
      <h3 className="mt-6 text-lg font-semibold">14. Is the content updated regularly?</h3>
      <p>Yes — constantly. AllEye’s content team monitors global cybersecurity trends and real-world incidents. Whenever there’s a major breach or new threat type, you’ll see a new story-based module explaining what happened and how to prevent it.</p>
      
      <h3 className="mt-6 text-lg font-semibold">15. What’s the bigger goal of this program?</h3>
      <p>To make security part of how we think, not just something we check off. Every small habit — locking your screen, updating passwords, reporting something unusual — adds up to a stronger, safer organization. AllEye’s mission is to make that awareness instinctive.</p>
    </div>
  );
};

export default FaqContent;
