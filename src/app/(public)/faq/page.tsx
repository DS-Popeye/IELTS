import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import "@/features/modules/modules.css";

export const metadata: Metadata = { title: "Frequently asked questions" };

const questions = [
  {
    question: "What can I use in this release?",
    answer: "This is the Phase 1 foundation: the homepage, dashboard, navigation, theme settings, profile, and authentication architecture. Reading, Listening, Writing, Speaking, mock tests, and analytics have preview pages. Their practice engines and content are not available yet.",
  },
  {
    question: "Is Aster an official IELTS service?",
    answer: "No. Aster is a temporary brand for an independent IELTS Academic preparation project. It is not affiliated with, endorsed by, or operated by the owners of IELTS. Future practice results will not be official IELTS scores.",
  },
  {
    question: "Do I need an account to explore?",
    answer: "The demonstration workspace can be explored without an account. It contains no real learner data or test questions. In connected mode, the private workspace requires an authorized account. Registration and Google sign-in do not automatically grant access to the private release.",
  },
  {
    question: "Why is sign-in unavailable in the demonstration?",
    answer: "Real sign-in requires the project owner to connect Supabase and configure email or Google authentication. The demonstration does not send or store sign-in credentials. You can explore the interface while that setup is pending.",
  },
  {
    question: "Where are the practice questions and band scores?",
    answer: "No question bank has been supplied or published. The foundation uses honest empty states instead of invented questions, scores, or study history. A target band in your profile is a goal you choose, not an evaluated result.",
  },
  {
    question: "Is AI feedback available now?",
    answer: "No AI models are trained or connected in Phase 1. Handwriting recognition, Writing evaluation, and Speaking assistance are separate later stages. Any future estimates will require validation and will be clearly labeled as experimental.",
  },
  {
    question: "Does Aster support General Training?",
    answer: "This project is designed for IELTS Academic only. General Training is outside the documented scope.",
  },
  {
    question: "Are there subscriptions or paid features?",
    answer: "There is no payment or subscription functionality in this release. The initial private platform is planned to be free to use. Availability will depend on the project’s configured hosting and infrastructure limits.",
  },
];

export default function FaqPage() {
  return (
    <>
      <PublicHeader />
      <main id="main-content" className="legal-page">
        <p className="eyebrow">A little clarity</p>
        <h1>Good questions.<br />Clear answers.</h1>
        <p className="legal-intro">What’s ready, what’s coming next, and what to expect from the Aster foundation.</p>
        <div className="faq-list">
          {questions.map((item, index) => (
            <details key={item.question} open={index === 0}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
        <div className="legal-bottom-link"><Link href="/dashboard" className="button button-primary">Explore the workspace <ArrowRight size={16} aria-hidden="true" /></Link></div>
      </main>
      <PublicFooter />
    </>
  );
}
