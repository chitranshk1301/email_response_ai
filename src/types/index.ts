export interface Email {
    id: string;
    threadId: string;
    payload: {
      headers: Array<{
        name: string;
        value: string;
      }>;
    };
    snippet?: string;
  }
  
  export interface ProcessedEmail {
    label: string;
    response: string;
  }