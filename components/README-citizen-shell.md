Citizen Page Shell
===================

`CitizenPageShell` provides a consistent layout scaffold for pages under `/citizen`.

Goals:
- Unified vertical spacing + max width handling
- Standard header pattern (title, description, actions) – optional / override-able
- Consistent background + typography alignment with detailed issue view

Basic Usage:
```tsx
import CitizenPageShell from '@/components/citizen-page-shell'
import Navbar from '@/components/navbar'

export default function Example() {
  return (
    <CitizenPageShell
      title="Example Page"
      description="Short supporting context copy."
      actions={<Button size="sm">Action</Button>}
      maxWidth="6xl"
    >
      <Navbar />
      <div>Your content here</div>
    </CitizenPageShell>
  )
}
```

Props:
- `title` / `description` / `actions` – optional elements for the header area.
- `headerOverride` – provide a full custom header node (replaces title/description/actions layout).
- `hideHeader` – suppress header entirely.
- `maxWidth` – one of `4xl | 5xl | 6xl | 7xl` (default `6xl`).
- `compact` – reduces vertical padding.
- `sectionClassName` / `className` – fine-tune inner/outer wrappers.

Extension Ideas:
- Breadcrumb slot
- Sticky action bar variant
- Integrated auth/role guard wrapper
