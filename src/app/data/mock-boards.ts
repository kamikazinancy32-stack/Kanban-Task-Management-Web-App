import { Board } from './models';

export const MOCK_BOARDS: Board[] = [
  {
    id: 'platform-launch',
    name: 'Platform Launch',
    tasks: [
      {
        id: '1',
        title: 'Design the sign-up flow',
        description:
          'Create the screens a new user sees when creating an account, from the first form to the welcome message.',
        status: 'todo',
        priority: 'high',
        subtasks: [
          { title: 'Wireframe the sign-up screen', isCompleted: true },
          { title: 'Write form validation rules', isCompleted: false },
          { title: 'Review the flow with the product team', isCompleted: false },
        ],
      },
      {
        id: '2',
        title: 'Set up error monitoring',
        description: 'Make sure we hear about errors in production before our users report them.',
        status: 'todo',
        priority: 'medium',
        subtasks: [
          { title: 'Choose a monitoring tool', isCompleted: true },
          { title: 'Add error tracking to the frontend', isCompleted: false },
        ],
      },
      {
        id: '3',
        title: 'Write the launch announcement',
        description: 'Prepare the blog post and social media copy for launch day.',
        status: 'todo',
        priority: 'low',
        subtasks: [
          { title: 'Draft the blog post', isCompleted: false },
          { title: 'Prepare social media copy', isCompleted: false },
          { title: 'Get sign-off from marketing', isCompleted: false },
        ],
      },
      {
        id: '4',
        title: 'Build the pricing page',
        description:
          'Show our plans side by side so visitors can compare features and choose the right one.',
        status: 'doing',
        priority: 'high',
        subtasks: [
          { title: 'Create the plan comparison table', isCompleted: true },
          { title: 'Add a FAQ section', isCompleted: true },
          { title: 'Connect the checkout links', isCompleted: false },
          { title: 'Test the layout on mobile', isCompleted: false },
        ],
      },
      {
        id: '5',
        title: 'Add search to the help center',
        description: 'Let users find help articles by keyword instead of browsing every category.',
        status: 'doing',
        priority: 'medium',
        subtasks: [
          { title: 'Index the help articles', isCompleted: true },
          { title: 'Build the search results list', isCompleted: false },
        ],
      },
      {
        id: '6',
        title: 'Run an accessibility audit',
        description:
          'Check the main pages against accessibility guidelines and fix the most important issues.',
        status: 'doing',
        priority: 'high',
        subtasks: [
          { title: 'Check color contrast', isCompleted: true },
          { title: 'Test keyboard navigation', isCompleted: true },
          { title: 'Fix missing focus styles', isCompleted: false },
        ],
      },
      {
        id: '7',
        title: 'Configure production hosting',
        description: 'Set up the hosting environment and a custom domain for the live site.',
        status: 'done',
        priority: 'high',
        subtasks: [
          { title: 'Create the hosting account', isCompleted: true },
          { title: 'Connect the custom domain', isCompleted: true },
        ],
      },
      {
        id: '8',
        title: 'Create the brand style guide',
        description: 'Document our colors, typography and logo usage so the team stays consistent.',
        status: 'done',
        priority: 'low',
        subtasks: [
          { title: 'Choose the color palette', isCompleted: true },
          { title: 'Document typography rules', isCompleted: true },
        ],
      },
      {
        id: '9',
        title: 'Plan beta tester sessions',
        description: 'Schedule feedback calls with our first ten beta testers.',
        status: 'done',
        priority: 'medium',
        subtasks: [
          { title: 'Invite beta testers', isCompleted: true },
          { title: 'Prepare interview questions', isCompleted: true },
          { title: 'Book the sessions', isCompleted: true },
        ],
      },
    ],
  },
  {
    id: 'marketing-plan',
    name: 'Marketing Plan',
    tasks: [
      {
        id: '1',
        title: 'Research competitor pricing',
        description: 'Compare how three main competitors price their plans and what each plan includes.',
        status: 'todo',
        priority: 'medium',
        subtasks: [
          { title: 'List the main competitors', isCompleted: true },
          { title: 'Compare plan features', isCompleted: false },
        ],
      },
      {
        id: '2',
        title: 'Plan the Q1 content calendar',
        description: 'Decide which articles, videos and newsletters we publish each week next quarter.',
        status: 'todo',
        priority: 'high',
        subtasks: [
          { title: 'Collect topic ideas', isCompleted: false },
          { title: 'Assign writers', isCompleted: false },
          { title: 'Set publishing dates', isCompleted: false },
        ],
      },
      {
        id: '3',
        title: 'Write a customer case study',
        description: 'Interview one of our early customers and turn their story into a short case study.',
        status: 'doing',
        priority: 'medium',
        subtasks: [
          { title: 'Interview the customer', isCompleted: true },
          { title: 'Write the first draft', isCompleted: false },
        ],
      },
      {
        id: '4',
        title: 'Launch the newsletter sign-up form',
        description: 'Add a simple sign-up form to the website footer and blog pages.',
        status: 'doing',
        priority: 'low',
        subtasks: [
          { title: 'Design the form', isCompleted: true },
          { title: 'Write the welcome email', isCompleted: false },
        ],
      },
      {
        id: '5',
        title: 'Define target audience personas',
        description: 'Describe the three types of customers we want to reach first.',
        status: 'done',
        priority: 'high',
        subtasks: [
          { title: 'Review customer survey results', isCompleted: true },
          { title: 'Write the persona descriptions', isCompleted: true },
        ],
      },
    ],
  },
  {
    id: 'roadmap',
    name: 'Roadmap',
    tasks: [
      {
        id: '1',
        title: 'Collect feature requests from support',
        description: 'Gather the most common feature requests from the last three months of support tickets.',
        status: 'todo',
        priority: 'low',
        subtasks: [
          { title: 'Export support tickets', isCompleted: false },
          { title: 'Group requests by theme', isCompleted: false },
        ],
      },
      {
        id: '2',
        title: 'Prioritize next quarter themes',
        description: 'Agree on the three product themes the team will focus on next quarter.',
        status: 'todo',
        priority: 'high',
        subtasks: [
          { title: 'Score each theme by impact', isCompleted: true },
          { title: 'Present the shortlist to leadership', isCompleted: false },
        ],
      },
      {
        id: '3',
        title: 'Prototype mobile app navigation',
        description: 'Test two navigation layouts for the mobile app with a clickable prototype.',
        status: 'doing',
        priority: 'medium',
        subtasks: [
          { title: 'Build the tab bar version', isCompleted: true },
          { title: 'Build the side menu version', isCompleted: false },
          { title: 'Test both with five users', isCompleted: false },
        ],
      },
      {
        id: '4',
        title: 'Publish the public roadmap page',
        description: 'Share what we are working on next so customers can follow our progress.',
        status: 'done',
        priority: 'medium',
        subtasks: [
          { title: 'Write the roadmap summary', isCompleted: true },
          { title: 'Publish the page', isCompleted: true },
        ],
      },
    ],
  },
];
