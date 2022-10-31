import { javascript } from "@codemirror/lang-javascript"
import { LanguageSupport } from "@codemirror/language"
import { rust } from "@codemirror/lang-rust"
import { python } from "@codemirror/lang-python"
import { css } from "@codemirror/lang-css"
import { html } from "@codemirror/lang-html"
import { markdown } from "@codemirror/lang-markdown"
import { cpp } from "@codemirror/lang-cpp"
import { java } from "@codemirror/lang-java"
import { sql } from "@codemirror/lang-sql"
import { php } from "@codemirror/lang-php"

export const languages: {
  id: string
  name: string
  extension?: () => LanguageSupport
}[] = [
  {
    id: "plaintext",
    name: "Plain Text",
  },
  {
    id: "javascript",
    name: "JavaScript",
    extension: () => javascript(),
  },
  {
    id: "jsx",
    name: "JSX",
    extension: () => javascript({ jsx: true }),
  },
  {
    id: "typescript",
    name: "TypeScript",
    extension: () => javascript({ typescript: true }),
  },
  {
    id: "tsx",
    name: "TSX",
    extension: () => javascript({ typescript: true, jsx: true }),
  },
  {
    id: "python",
    name: "Python",
    extension: () => python(),
  },
  {
    id: "rust",
    name: "Rust",
    extension: () => rust(),
  },
  {
    id: "css",
    name: "CSS",
    extension: () => css(),
  },
  {
    id: "html",
    name: "HTML",
    extension: () => html(),
  },
  {
    id: "markdown",
    name: "Markdown",
    extension: () => markdown(),
  },
  {
    id: "cpp",
    name: "C++",
    extension: () => cpp(),
  },
  {
    id: "c",
    name: "C",
    extension: () => cpp(),
  },
  {
    id: "csharp",
    name: "C#",
    extension: () => cpp(),
  },
  {
    id: "java",
    name: "Java",
    extension: () => java(),
  },
  {
    id: "sql",
    name: "SQL",
    extension: () => sql(),
  },
  {
    id: "php",
    name: "PHP",
    extension: () => php(),
  },
].sort((a, b) => {
  return a.name < b.name ? -1 : 1
})

export const getLanguageName = (id: string) =>
  languages.find((lang) => lang.id === id)?.name
