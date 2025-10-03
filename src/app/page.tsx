import { Calculator } from 'lucide-react';
import { LoanComparison } from '@/components/features/loan-comparison';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Calculator className="h-10 w-10" />
            <h1 className="text-4xl font-bold">Mortgage Loan Calculator</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Compare two mortgage loan options side by side
          </p>
        </header>

        <main>
          <LoanComparison />
        </main>
      </div>
    </div>
  );
}
