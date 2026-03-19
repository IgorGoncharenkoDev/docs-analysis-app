import { CheckCircle } from 'lucide-react'
import Link from 'next/link'

import { features, steps } from '@/app/data/data'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function Home() {
  return (
    <>
      <section className="py-20 text-center">
        <div className="container max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            AI-Powered Document Analysis for{' '}
            <span className="bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Teams
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Upload, analyze, and collaborate on documents with your
            organization. Get instant AI insights and summaries.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up">
              <Button className="px-8" size="lg">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button className="px-8" size="lg" variant="outline">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything You Need
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map(({ title, description, icon: Icon }) => (
              <Card className="border-none shadow-sm" key={title}>
                <CardHeader>
                  <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-lg mb-4">
                    <div className="text-blue-600">
                      <Icon className="w-8 h-8" />
                    </div>
                  </div>
                  <CardTitle>{title}</CardTitle>
                  <CardDescription>{description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="space-y-4 max-w-md mx-auto">
            {steps.map((step) => (
              <div
                className="flex items-center gap-4 p-4 bg-white border rounded-lg"
                key={step}
              >
                <div className="shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                </div>
                <span className="font-medium">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-linear-to-r from-blue-50 to-indigo-50">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to analyze your documents?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of teams using DocsAI to work smarter with their
            documents.
          </p>
          <Link href="/sign-up">
            <Button className="px-8" size="lg">
              Get Started Free
            </Button>
          </Link>
          <p className="text-sm text-gray-500 mt-4">
            No credit card required • 14-day free trial
          </p>
        </div>
      </section>
    </>
  )
}
