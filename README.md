# Custom Virtualized DataGrid (React + TypeScript)

A high-performance, accessible, and scalable **custom DataGrid** built from scratch using **React + TypeScript**, without relying on third-party grid libraries.  
Designed to handle **large datasets (50k+ rows)** efficiently while maintaining smooth scrolling, keyboard accessibility, and extensibility.

---

## 🚀 Features

### Core Grid Capabilities
- Virtualized rows for large datasets
- Column virtualization (horizontal)
- Sticky header
- Column resizing (mouse + keyboard)
- Column reordering
- Sorting (single & multi-column)
- Keyboard navigation (arrow keys, enter, escape)
- Cell editing with validation
- Optimistic UI updates for edits

### Performance
- Smooth scrolling at **55–60 FPS** with 50,000 rows
- Minimal layout thrashing
- Efficient DOM usage
- Controlled memory growth under stress
- No external virtualization libraries used

### Accessibility (A11y)
- WAI-ARIA compliant grid roles
- Keyboard-only navigation support
- Screen reader tested (NVDA on Windows)
- ARIA live regions for edit feedback
- Focus management for cells and headers

---

## 🧠 Design Philosophy

- **No heavy grid libraries** (AG Grid, MUI Grid, etc.)
- Predictable React patterns
- Separation of concerns
- Performance first, correctness always
- Readable, maintainable code over clever hacks

---

## 🛠️ Tech Stack

- **React**
- **TypeScript**
- **Storybook** (for documentation & testing)
- **Tailwind CSS** (utility-first styling)
- **ARIA / Accessibility APIs**
- **Chrome / Edge DevTools** for profiling

---

## 📁 Project Structure

src/
├── DataGrid.tsx # Core DataGrid implementation
├── types.ts # Shared grid & column types
├── index.ts # Public exports
├── stories/
│ ├── datagrid.stories.tsx
│ ├── Basic.stories.tsx
│ ├── LargeDataset.stories.tsx
│ └── EditableCells.stories.tsx
└── styles/

## 📊 Performance Testing
## Test Environment

Device: Laptop
CPU: Intel i3-1115G4 (11th Gen)
RAM: 12GB (4GB + 8GB)
OS: Windows
Browser: Microsoft Edge

## Dataset
Rows: 50,000
Columns: 10+
Row height: 36px

## Results
FPS: 55–60
Frame time: <16ms
Interaction latency: <100ms
JS Heap: ~1.1–1.27GB under stress
No browser freezes or crashes
📄 Performance Report (with screenshots) included as PDF.
🧪 Storybook

## Storybook is used for:
Visual testing
Accessibility testing
Performance observation
Interaction validation

Run Storybook:
npm run storybook

## 🔍 Known Limitations
Pinned column not working