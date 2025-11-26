import {
  Button as ShadcnButton,
  buttonVariants,
} from './button.tsx'

// Re-export the named shadcn Button and provide a default wrapper for compatibility
export { ShadcnButton as Button, buttonVariants }
export default ShadcnButton
