import { serve } from 'inngest/next';
import { inngest } from '@/inngest/client';

// Import your Inngest functions here
import { exampleFunction } from '@/inngest/functions/example';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    // Add your functions here
    exampleFunction,
  ],
  // Enable streaming for Vercel - extends timeout to 800s on paid plans
  streaming: 'force',
});
