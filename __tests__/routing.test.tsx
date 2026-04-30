import { render, screen } from '@testing-library/react';
import LandingPage from '@/app/page';
import Dashboard from '@/app/dashboard/page';

// Mock the next/link component
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

// Mock TechLogos
jest.mock('@/components/TechLogos', () => ({
  GeminiLogo: () => <div data-testid="gemini-logo" />,
  FirebaseLogo: () => <div data-testid="firebase-logo" />,
  BigQueryLogo: () => <div data-testid="bigquery-logo" />,
  CloudRunLogo: () => <div data-testid="cloudrun-logo" />,
  VertexAILogo: () => <div data-testid="vertexai-logo" />,
}));

describe('Routing and Navigation', () => {
  test('Landing Page renders Hero section', () => {
    render(<LandingPage />);
    expect(screen.getByText(/Navigate Elections with/i)).toBeInTheDocument();
    expect(screen.getByText(/Absolute Trust/i)).toBeInTheDocument();
  });

  test('Landing Page has Launch Dashboard link', () => {
    render(<LandingPage />);
    const links = screen.getAllByText(/Launch Dashboard/i);
    expect(links[0]).toHaveAttribute('href', '/dashboard');
  });

  test('Dashboard renders with AI Assistant header', () => {
    render(<Dashboard />);
    expect(screen.getByText(/AI Civic Assistant/i)).toBeInTheDocument();
  });

  test('Dashboard renders Risk Monitoring section', () => {
    render(<Dashboard />);
    expect(screen.getByText(/Risk Monitoring/i)).toBeInTheDocument();
  });
});
