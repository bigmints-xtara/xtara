import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AdminListTile from './AdminListTile';

describe('AdminListTile', () => {
    const defaultProps = {
        title: 'Test Title',
        subtitle: 'Test Subtitle',
        domain: 'Test Domain',
        status: 'Published',
        isSelected: false,
        onTap: vi.fn(),
        onAction: vi.fn(),
    };

    it('triggers onTap when the tile button is clicked', () => {
        render(<AdminListTile {...defaultProps} />);
        // The main button that wraps the content
        const tileButton = screen.getByRole('button', { name: /test title/i });
        fireEvent.click(tileButton);
        expect(defaultProps.onTap).toHaveBeenCalledTimes(1);
    });

    it('triggers onTap when the subtitle (inside the button) is clicked', () => {
        render(<AdminListTile {...defaultProps} />);
        const subtitle = screen.getByText(/test subtitle/i);
        fireEvent.click(subtitle);
        expect(defaultProps.onTap).toHaveBeenCalledTimes(1);
    });

    it('does NOT trigger onTap when the more actions button is clicked', () => {
        render(<AdminListTile {...defaultProps} />);
        // The MoreVertical button is outside the main onTap button
        const buttons = screen.getAllByRole('button');
        const moreButton = buttons.find(b => b.querySelector('svg')); 
        if (!moreButton) throw new Error('More button not found');
        
        fireEvent.click(moreButton);
        expect(defaultProps.onTap).not.toHaveBeenCalled();
    });

    it('triggers onAction when an action menu item is clicked', () => {
        render(<AdminListTile {...defaultProps} />);
        
        // Find the "Edit" action button
        const editButton = screen.getByText('Edit');
        fireEvent.click(editButton);
        
        expect(defaultProps.onAction).toHaveBeenCalledWith('edit');
        expect(defaultProps.onTap).not.toHaveBeenCalled();
    });
});
