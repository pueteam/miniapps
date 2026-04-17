import { drag } from 'd3-drag';
import { select } from 'd3-selection';
import { useEffect, useRef, type Ref } from 'preact/hooks';
import { reorderProfiles } from '../state/actions';

interface UseProfileDragOptions {
  profileId: string;
  currentIndex: number;
  totalProfiles: number;
  rowHeight: number;
  ref: Ref<HTMLDivElement>;
}

export function useProfileDrag(options: UseProfileDragOptions) {
  const optionsRef = useRef(options);
  const dragStateRef = useRef({ isDragging: false, totalDy: 0, origIndex: 0 });

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    const el = options.ref.current;
    if (!el) return;

    let totalDy = 0;
    let origIndex = optionsRef.current.currentIndex;
    const rowHeight = optionsRef.current.rowHeight;

    // Handle native HTML drag events
    const handleDragStart = (event: DragEvent) => {
      dragStateRef.current.isDragging = true;
      dragStateRef.current.origIndex = optionsRef.current.currentIndex;
      dragStateRef.current.totalDy = 0;
      
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/html', el.innerHTML);
        // Set a drag image to prevent the default ghosting
        const dragImage = document.createElement('div');
        dragImage.style.position = 'absolute';
        dragImage.style.top = '-9999px';
        dragImage.textContent = optionsRef.current.profileId;
        document.body.appendChild(dragImage);
        event.dataTransfer.setDragImage(dragImage, 0, 0);
        setTimeout(() => dragImage.remove(), 0);
      }
      
      el.classList.add('profile-row--dragging');
    };

    const handleDragEnd = (event: DragEvent) => {
      event.preventDefault();
      dragStateRef.current.isDragging = false;
      el.classList.remove('profile-row--dragging', 'profile-row--drag-active', 'profile-row--can-drop');
      el.style.transform = '';
    };

    const dragBehavior = drag<HTMLDivElement, unknown>()
      .on('start', () => {
        totalDy = 0;
        origIndex = optionsRef.current.currentIndex;
        el.classList.add('profile-row--dragging');
      })
      .on('drag', (event) => {
        totalDy += event.dy;
        
        // Show visual feedback during drag
        el.style.transform = `translateY(${totalDy}px)`;
        el.classList.add('profile-row--drag-active');

        // Calculate which row we're hovering over
        const rowDelta = Math.round(totalDy / rowHeight);
        const newIndex = Math.max(0, Math.min(optionsRef.current.totalProfiles - 1, origIndex + rowDelta));
        
        // Add/remove visual indicators for drop zones
        if (newIndex !== origIndex) {
          el.classList.add('profile-row--can-drop');
        } else {
          el.classList.remove('profile-row--can-drop');
        }
      })
      .on('end', () => {
        el.classList.remove('profile-row--dragging', 'profile-row--drag-active', 'profile-row--can-drop');
        
        // Ignore very small drags (< 8px) to avoid accidental reorders
        if (Math.abs(totalDy) < 8) {
          el.style.transform = '';
          return;
        }

        // Calculate the new index based on drag distance
        const rowDelta = Math.round(totalDy / rowHeight);
        const newIndex = Math.max(0, Math.min(optionsRef.current.totalProfiles - 1, origIndex + rowDelta));

        el.style.transform = '';

        // Only reorder if the position actually changed
        if (newIndex !== origIndex) {
          reorderProfiles(optionsRef.current.profileId, origIndex, newIndex);
        }
      });

    // Set up event listeners for native HTML drag and d3 drag
    el.addEventListener('dragstart', handleDragStart);
    el.addEventListener('dragend', handleDragEnd);
    select(el).call(dragBehavior);

    return () => {
      el.removeEventListener('dragstart', handleDragStart);
      el.removeEventListener('dragend', handleDragEnd);
      select(el).on('.drag', null);
    };
  }, [options.ref]);
}

