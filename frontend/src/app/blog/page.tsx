import React from 'react';
import { Clock, ArrowRight, BookOpen } from 'lucide-react';
import { Badge } from '../../components/ui/badge';

const BLOG_POSTS = [
  {
    id: 'post-1',
    title: 'Migrating a Monolith to NestJS Microservices: Lessons from 10M Requests/Day',
    excerpt:
      'A deep architectural look at how we transitioned a legacy service to a message-driven microservice cluster without a single second of user downtime.',
    author: 'Marcus Vance',
    date: 'March 14, 2026',
    readTime: '8 min read',
    category: 'Architecture',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'post-2',
    title: 'The 2026 Roadmap to Generative AI & Autonomous Agent Engineering',
    excerpt:
      'Vector databases, tool-calling LLMs, and guardrails: Everything you need to know to build production agents today.',
    author: 'Dr. Elena Rostova',
    date: 'March 08, 2026',
    readTime: '12 min read',
    category: 'AI & Machine Learning',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'post-3',
    title: 'How to Ace the Staff Software Engineer System Design Interview',
    excerpt:
      'Frameworks for tackling complex distributed systems problems with composure, clarity, and structural rigor.',
    author: 'Devin K. Chen',
    date: 'February 28, 2026',
    readTime: '10 min read',
    category: 'Career Growth',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'post-4',
    title: 'Building Accessible Design Systems with Figma Variables & Tailwind v4',
    excerpt:
      'Bridging the gap between UI designers and front-end teams using standardized tokens and automated linting.',
    author: 'Sarah Lindqvist',
    date: 'February 20, 2026',
    readTime: '6 min read',
    category: 'Design Systems',
    image: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=800&q=80',
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <BookOpen className="w-3.5 h-3.5" />
            Engineering & Learning Insights
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            LearnX Publication
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Articles, system design breakdowns, and career playbooks written by senior engineers and industry instructors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {BLOG_POSTS.map((post) => (
            <article
              key={post.id}
              className="group flex flex-col rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:border-slate-300 transition"
            >
              <div className="aspect-[16/9] w-full overflow-hidden bg-slate-100 relative">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute top-3 left-3">
                  <Badge variant="primary" size="sm" className="bg-white/95 text-slate-900 border border-slate-200 shadow-sm">
                    {post.category}
                  </Badge>
                </div>
              </div>

              <div className="p-6 flex flex-col flex-1 justify-between space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span>{post.date}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readTime}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {post.excerpt}
                  </p>
                </div>

                <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700">
                    By {post.author}
                  </span>
                  <span className="font-semibold text-indigo-600 inline-flex items-center gap-1">
                    Read Story <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
