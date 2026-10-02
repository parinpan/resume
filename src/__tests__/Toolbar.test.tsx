import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toolbar } from '@/components/Toolbar';

describe('Toolbar', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the toolbar bar', () => {
    render(<Toolbar />);
    expect(screen.getByText(/worth keeping/)).toBeInTheDocument();
  });

  it('renders a download button', () => {
    render(<Toolbar />);
    const button = screen.getByRole('button', { name: /Download PDF/i });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it('renders a dismiss button', () => {
    render(<Toolbar />);
    const dismiss = screen.getByRole('button', { name: /dismiss/i });
    expect(dismiss).toBeInTheDocument();
  });

  it('hides the toolbar when dismiss is clicked', async () => {
    const user = userEvent.setup();
    render(<Toolbar />);

    expect(screen.getByText(/worth keeping/)).toBeInTheDocument();
    const dismiss = screen.getByRole('button', { name: /dismiss/i });
    await user.click(dismiss);
    expect(screen.queryByText(/worth keeping/)).not.toBeInTheDocument();
  });

  it('shows "Generating..." while downloading', async () => {
    const user = userEvent.setup();
    // Make fetch hang indefinitely
    vi.spyOn(globalThis, 'fetch').mockImplementation(
      () => new Promise(() => {}),
    );

    render(<Toolbar />);
    const button = screen.getByRole('button', { name: /Download PDF/i });
    await user.click(button);

    expect(screen.getByText(/Generating\.\.\./)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Generating/i })).toBeDisabled();
  });

  it('calls fetch to /api/pdf on download click', async () => {
    const user = userEvent.setup();
    const mockBlob = new Blob(['pdf'], { type: 'application/pdf' });
    const mockResponse = { ok: true, blob: () => Promise.resolve(mockBlob) } as unknown as Response;
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse);

    // Mock URL APIs
    const mockUrl = 'blob:http://localhost/test';
    vi.spyOn(URL, 'createObjectURL').mockReturnValue(mockUrl);
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

    render(<Toolbar />);
    const button = screen.getByRole('button', { name: /Download PDF/i });
    await user.click(button);

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith('/api/pdf');
    });
  });

  it('shows alert on fetch failure', async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'));
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<Toolbar />);
    const button = screen.getByRole('button', { name: /Download PDF/i });
    await user.click(button);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Failed to generate PDF. Please try again.');
    });
  });

  it('shows alert on non-ok response', async () => {
    const user = userEvent.setup();
    const mockResponse = { ok: false, status: 500, statusText: 'Internal Server Error' } as unknown as Response;
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse);
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<Toolbar />);
    const button = screen.getByRole('button', { name: /Download PDF/i });
    await user.click(button);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Failed to generate PDF. Please try again.');
    });
  });

  it('re-enables button after successful download', async () => {
    const user = userEvent.setup();
    const mockBlob = new Blob(['pdf'], { type: 'application/pdf' });
    const mockResponse = { ok: true, blob: () => Promise.resolve(mockBlob) } as unknown as Response;
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse);
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

    render(<Toolbar />);
    const button = screen.getByRole('button', { name: /Download PDF/i });
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Download PDF/i })).not.toBeDisabled();
    });
  });

  it('re-enables button after failed download', async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('fail'));
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<Toolbar />);
    const button = screen.getByRole('button', { name: /Download PDF/i });
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Download PDF/i })).not.toBeDisabled();
    });
  });

  it('renders an SVG icon in the download button', () => {
    const { container } = render(<Toolbar />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
